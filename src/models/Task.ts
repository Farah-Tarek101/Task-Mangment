import mongoose, { Document, Schema, Types } from 'mongoose';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/helpers';
import { TaskPriority, TaskStatus } from '../types';

export interface ITask extends Document {
  project_id: Types.ObjectId;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: Date | null;
  created_at: Date;
  updated_at: Date;
}

const taskSchema = new Schema<ITask>(
  {
    project_id: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'project_id is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: `Status must be one of: ${TASK_STATUSES.join(', ')}`,
      },
      default: 'todo',
    },
    priority: {
      type: String,
      enum: {
        values: TASK_PRIORITIES,
        message: `Priority must be one of: ${TASK_PRIORITIES.join(', ')}`,
      },
      default: 'medium',
    },
    due_date: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      transform(
        _doc,
        ret: Record<string, unknown> & {
          _id?: { toString(): string };
          project_id: { toString(): string };
          __v?: number;
        }
      ) {
        ret.id = ret._id!.toString();
        ret.project_id = ret.project_id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

taskSchema.index({ project_id: 1, status: 1 });
taskSchema.index({ project_id: 1, priority: 1 });
taskSchema.index({ project_id: 1, due_date: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ due_date: 1 });
taskSchema.index({ created_at: -1 });
taskSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ITask>('Task', taskSchema);
