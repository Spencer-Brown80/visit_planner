"""changed

Revision ID: 97faeeddf968
Revises: f1d951153288
Create Date: 2024-05-25 15:37:28.221003

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '97faeeddf968'
down_revision = 'f1d951153288'
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
