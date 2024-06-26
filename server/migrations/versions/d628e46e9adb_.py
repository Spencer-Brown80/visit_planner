"""empty message

Revision ID: d628e46e9adb
Revises: 913e77f0dd49
Create Date: 2024-05-18 18:29:40.006262

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd628e46e9adb'
down_revision = '913e77f0dd49'
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
