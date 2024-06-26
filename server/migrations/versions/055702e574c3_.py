"""empty message

Revision ID: 055702e574c3
Revises: c87439e5c2b5
Create Date: 2024-05-18 07:27:36.726742

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '055702e574c3'
down_revision = 'c87439e5c2b5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_events_date'), ['date'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_events_date'))

    # ### end Alembic commands ###
