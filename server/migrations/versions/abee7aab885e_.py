"""empty message

Revision ID: abee7aab885e
Revises: d81912487513
Create Date: 2024-05-22 18:27:43.233570

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abee7aab885e'
down_revision = 'd81912487513'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('start', sa.DateTime(), nullable=False))
        batch_op.add_column(sa.Column('end', sa.DateTime(), nullable=False))
        batch_op.drop_index('ix_events_date')
        batch_op.create_index(batch_op.f('ix_events_start'), ['start'], unique=False)
        batch_op.drop_column('date')
        batch_op.drop_column('start_time')
        batch_op.drop_column('duration')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('events', schema=None) as batch_op:
        batch_op.add_column(sa.Column('duration', sa.INTEGER(), nullable=False))
        batch_op.add_column(sa.Column('start_time', sa.TIME(), nullable=False))
        batch_op.add_column(sa.Column('date', sa.DATETIME(), nullable=False))
        batch_op.drop_index(batch_op.f('ix_events_start'))
        batch_op.create_index('ix_events_date', ['date'], unique=False)
        batch_op.drop_column('end')
        batch_op.drop_column('start')

    # ### end Alembic commands ###
