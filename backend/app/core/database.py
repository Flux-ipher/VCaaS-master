"""
Database configuration for VCaaS platform.
Handles PostgreSQL connection, session management, and base models.
"""

from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from typing import AsyncGenerator, Generator
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Create both sync and async engines for compatibility
# Async engine for modern async endpoints
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Sync engine for existing endpoints
if settings.DATABASE_URL.startswith("sqlite"):
    # Use synchronous sqlite driver for sync engine
    sync_url = settings.DATABASE_URL
    # if "+aiosqlite" in sync_url:
    #     sync_url = sync_url.replace("+aiosqlite", "")
    # Simple replacement to ensure valid sync URL from async one
    sync_url = sync_url.replace("+aiosqlite", "")
    
    sync_engine = create_engine(
        sync_url,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
else:
    sync_engine = create_engine(
        settings.DATABASE_URL.replace("+asyncpg", ""),
        pool_size=20,
        max_overflow=30,
        pool_pre_ping=True,
        echo=settings.DEBUG,
    )

# Create session makers
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

SyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine
)

# Create base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get async database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_db() -> Generator:
    """Dependency to get sync database session (for compatibility)"""
    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()

async def create_tables():
    """Create all database tables"""
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

def create_tables_sync():
    """Create all tables synchronously"""
    # Ensure models are imported so metadata is populated
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=sync_engine)
    logger.info("Database tables created successfully")

class DatabaseManager:
    """Database management utilities."""
    
    def __init__(self):
        self.async_engine = async_engine
        self.sync_engine = sync_engine
        self.AsyncSessionLocal = AsyncSessionLocal
        self.SyncSessionLocal = SyncSessionLocal
    
    def get_sync_session(self):
        """Get a sync database session."""
        return SyncSessionLocal()
    
    def health_check(self) -> bool:
        """Check if database is accessible."""
        try:
            with sync_engine.connect() as connection:
                connection.execute(text("SELECT 1"))
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    def get_connection_info(self) -> dict:
        """Get database connection information."""
        url = sync_engine.url
        return {
            "drivername": url.drivername,
            "host": url.host,
            "port": url.port,
            "database": url.database,
            "username": url.username
        }

# Global database manager instance
db_manager = DatabaseManager()

# Export engine for main.py (aliased to async_engine)
engine = async_engine
