import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import normalize_phone, hash_phone


def test_phone_normalization_and_deduplication():
    # 10 digit Indian number
    p1 = normalize_phone("9876543210")
    assert p1 == "+919876543210"

    # Leading 0 number
    p2 = normalize_phone("09876543210")
    assert p2 == "+919876543210"

    # Standard +91 number with spaces
    p3 = normalize_phone("+91 98765 43210")
    assert p3 == "+919876543210"

    # Verify deduplication hashes match
    assert hash_phone(p1) == hash_phone(p2) == hash_phone(p3)


@pytest.mark.asyncio
async def test_agent_rbac_restrictions():
    """Verifies that an agent cannot modify or call another agent's lead."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login as Agent Rahul (EXE-204)
        rahul_login = await ac.post("/api/v1/auth/login", json={
            "email": "agent.rahul@apexrealty.com",
            "password": "AgentPass2026!"
        })
        assert rahul_login.status_code == 200
        rahul_token = rahul_login.json()["access_token"]
        rahul_headers = {"Authorization": f"Bearer {rahul_token}"}

        # 2. Login as Admin to find a lead assigned to Ananya (EXE-208)
        admin_login = await ac.post("/api/v1/auth/login", json={
            "email": "admin@apexrealty.com",
            "password": "AdminPass2026!"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        leads_res = await ac.get("/api/v1/leads", headers=admin_headers)
        leads = leads_res.json()
        ananya_lead = next((l for l in leads if "Ananya" in (l.get("assigned_agent_name") or "")), None)
        assert ananya_lead is not None

        # 3. Agent Rahul attempts to modify Ananya's lead -> 403 Forbidden
        update_res = await ac.post(
            f"/api/v1/leads/{ananya_lead['id']}/call",
            headers=rahul_headers
        )
        assert update_res.status_code == 403

        patch_res = await ac.patch(
            f"/api/v1/leads/{ananya_lead['id']}",
            headers=rahul_headers,
            json={"notes": "Hacked by unauthorized executive"}
        )
        assert patch_res.status_code == 403


@pytest.mark.asyncio
async def test_single_active_session_revocation():
    """Verifies that a previous JWT is rejected once a new login occurs."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # First login on device 1
        login1 = await ac.post("/api/v1/auth/login", json={
            "email": "agent.rahul@apexrealty.com",
            "password": "AgentPass2026!",
            "device_type": "LAPTOP"
        })
        token1 = login1.json()["access_token"]

        # Token 1 works
        profile1 = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"})
        assert profile1.status_code == 200

        # Second login on device 2
        login2 = await ac.post("/api/v1/auth/login", json={
            "email": "agent.rahul@apexrealty.com",
            "password": "AgentPass2026!",
            "device_type": "MOBILE_APP"
        })
        token2 = login2.json()["access_token"]

        # Token 2 works
        profile2 = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token2}"})
        assert profile2.status_code == 200

        # Token 1 must now be rejected with 401
        stale_profile = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token1}"})
        assert stale_profile.status_code == 401
