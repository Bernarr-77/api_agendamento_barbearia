"""Atualiza ServiceCategory

Revision ID: cc7638175d7d
Revises: 0ac898537fe8
Create Date: 2026-05-22 17:22:47.526833

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc7638175d7d'
down_revision: Union[str, Sequence[str], None] = '0ac898537fe8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE servicecategory RENAME TO servicecategory_old")
    op.execute("CREATE TYPE servicecategory AS ENUM('FISIOTERAPIA', 'QUIROPRAXIA', 'ESTETICO')")
    op.execute("ALTER TABLE servicos ALTER COLUMN category TYPE servicecategory USING category::text::servicecategory")
    op.execute("DROP TYPE servicecategory_old")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("ALTER TYPE servicecategory RENAME TO servicecategory_old")
    op.execute("CREATE TYPE servicecategory AS ENUM('ODONTOLOGICO', 'ESTETICO')")
    op.execute("ALTER TABLE servicos ALTER COLUMN category TYPE servicecategory USING category::text::servicecategory")
    op.execute("DROP TYPE servicecategory_old")
