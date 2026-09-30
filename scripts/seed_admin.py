"""Create an initial superadmin user. Run with: python -m scripts.seed_admin"""
import asyncio
import sys

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole
from app.repositories.user_repo import UserRepository


async def main():
    email = input("Admin email: ").strip()
    full_name = input("Full name: ").strip()
    password = input("Password: ").strip()

    if not email or not password:
        print("Email and password are required.")
        sys.exit(1)

    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        existing = await repo.get_by_email(email)
        if existing:
            existing.role = UserRole.SUPERADMIN
            existing.hashed_password = hash_password(password)
            await db.commit()
            print(f"Existing user {email} promoted to superadmin.")
            return

        await repo.create(
            full_name=full_name or "Admin",
            email=email,
            phone_number=None,
            hashed_password=hash_password(password),
            role=UserRole.SUPERADMIN,
        )
        await db.commit()
        print(f"Superadmin {email} created successfully.")


if __name__ == "__main__":
    asyncio.run(main())
