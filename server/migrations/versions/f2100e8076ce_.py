"""empty message

Revision ID: f2100e8076ce
Revises: 349763194029
Create Date: 2024-05-22 16:18:10.249666

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f2100e8076ce'
down_revision = '349763194029'
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
