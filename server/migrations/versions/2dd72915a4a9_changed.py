"""changed

Revision ID: 2dd72915a4a9
Revises: 110394c58d78
Create Date: 2024-05-24 19:37:12.387605

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2dd72915a4a9'
down_revision = '110394c58d78'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_index('ix_events_start')
        batch_op.create_index(batch_op.f('ix_events_start'), ['start'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_events_start'))
        batch_op.create_index('ix_events_start', ['start'], unique=False)

    # ### end Alembic commands ###
