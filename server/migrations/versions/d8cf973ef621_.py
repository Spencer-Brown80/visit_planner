"""empty message

Revision ID: d8cf973ef621
Revises: 30c26ab68642
Create Date: 2024-05-18 23:50:09.470611

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8cf973ef621'
down_revision = '30c26ab68642'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_index('ix_events_date')
        batch_op.create_index(batch_op.f('ix_events_date'), ['date'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_events_date'))
        batch_op.create_index('ix_events_date', ['date'], unique=False)

    # ### end Alembic commands ###
