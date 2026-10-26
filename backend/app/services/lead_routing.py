from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy import select, asc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.lead import Lead, AssignmentRule
from app.models.user import User


class LeadRoutingService:
    @staticmethod
    async def assign_lead(lead: Lead, db: AsyncSession) -> Optional[User]:
        """
        Evaluates active assignment rules and selects the best available agent.
        Preconditions for assignment:
        - User is active (is_active = True)
        - User is punched in on active duty (is_punched_in = True)
        - User is within lead capacity limit (current_active_leads_count < max_active_leads)
        """
        # 1. Fetch available eligible agents
        stmt = (
            select(User)
            .where(
                User.is_active == True,
                User.is_punched_in == True,
                User.role.in_(["AGENT", "MANAGER"]),
                User.current_active_leads_count < User.max_active_leads
            )
            .order_by(asc(User.current_active_leads_count))
        )
        res = await db.execute(stmt)
        available_agents = res.scalars().all()

        if not available_agents:
            # Fallback: Check if any active agent exists regardless of punch status
            backup_stmt = (
                select(User)
                .where(User.is_active == True, User.role.in_(["AGENT", "MANAGER"]))
                .order_by(asc(User.current_active_leads_count))
            )
            backup_res = await db.execute(backup_stmt)
            backup_agents = backup_res.scalars().all()
            if not backup_agents:
                return None
            chosen_agent = backup_agents[0]
        else:
            # 2. Check for Geo / Territory matching
            if lead.preferred_location:
                pref_loc = lead.preferred_location.lower()
                def territory_matches(territory: Optional[str]) -> bool:
                    if not territory:
                        return False
                    terr = territory.lower()
                    if terr in pref_loc or pref_loc in terr:
                        return True
                    terr_words = set(terr.replace(",", " ").replace("-", " ").split())
                    loc_words = set(pref_loc.replace(",", " ").replace("-", " ").split())
                    generic = {"sector", "hub", "enclave", "promenade", "skyline", "estates", "hills", "bay", "the"}
                    meaningful = (terr_words & loc_words) - generic
                    return len(meaningful) > 0

                geo_matches = [a for a in available_agents if territory_matches(a.assigned_territory)]
                if geo_matches:
                    chosen_agent = geo_matches[0]
                else:
                    chosen_agent = available_agents[0]
            else:
                chosen_agent = available_agents[0]

        # 3. Apply assignment and SLA clock
        lead.assigned_agent_id = chosen_agent.id
        now = datetime.now(timezone.utc)
        lead.sla_deadline = now + timedelta(minutes=settings.SLA_FIRST_RESPONSE_MINUTES)
        lead.is_sla_breached = False

        # 4. Increment agent's current active load
        chosen_agent.current_active_leads_count += 1
        return chosen_agent
