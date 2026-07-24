import { isDueDateValid, startOfToday } from '../../src/utils/helpers';
import logger from '../../src/utils/logger';
import {
  validateProjectCreate,
  validateStatusTransition,
  validateTaskCreate,
  validateTaskUpdate,
} from '../../src/validators';

describe('Task Validation', () => {
  describe('validateTaskCreate', () => {
    it('accepts valid task data', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = validateTaskCreate({
        title: 'Write tests',
        description: 'Unit tests for validators',
        status: 'todo',
        priority: 'high',
        due_date: tomorrow.toISOString(),
      });

      expect(result.title).toBe('Write tests');
      expect(result.priority).toBe('high');
      expect(result.due_date).toBeInstanceOf(Date);
    });

    it('rejects missing title', () => {
      expect(() => validateTaskCreate({})).toThrow('Validation failed');
    });

    it('rejects invalid status', () => {
      expect(() =>
        validateTaskCreate({ title: 'Test', status: 'invalid' as 'todo' })
      ).toThrow('Validation failed');
    });

    it('rejects invalid priority', () => {
      expect(() =>
        validateTaskCreate({ title: 'Test', priority: 'urgent' as 'high' })
      ).toThrow('Validation failed');
    });

    it('rejects past due date', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(() =>
        validateTaskCreate({ title: 'Test', due_date: yesterday.toISOString() })
      ).toThrow('Validation failed');
    });
  });

  describe('validateTaskUpdate', () => {
    it('accepts valid status update', () => {
      const result = validateTaskUpdate({ status: 'in_progress' }, 'todo');
      expect(result.status).toBe('in_progress');
    });

    it('allows clearing due date', () => {
      const result = validateTaskUpdate({ due_date: null }, 'todo');
      expect(result.due_date).toBeNull();
    });

    it('rejects past due date on update', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(() =>
        validateTaskUpdate({ due_date: yesterday.toISOString() }, 'todo')
      ).toThrow('Validation failed');
    });

    it('rejects empty update payload', () => {
      expect(() => validateTaskUpdate({}, 'todo')).toThrow('Validation failed');
    });
  });

  describe('validateStatusTransition', () => {
    it('logs unusual done to todo transition', () => {
      const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

      validateStatusTransition('done', 'todo');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unusual status transition: done → todo')
      );

      warnSpy.mockRestore();
    });

    it('does not log normal transitions', () => {
      const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

      validateStatusTransition('todo', 'in_progress');

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});

describe('Due Date Validation', () => {
  it('accepts today as valid due date', () => {
    const today = startOfToday();
    expect(isDueDateValid(today.toISOString())).toBe(true);
  });

  it('accepts future due date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 7);
    expect(isDueDateValid(future.toISOString())).toBe(true);
  });

  it('rejects past due date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(isDueDateValid(past.toISOString())).toBe(false);
  });

  it('accepts undefined/null due date', () => {
    expect(isDueDateValid(undefined)).toBe(true);
    expect(isDueDateValid(null)).toBe(true);
  });
});

describe('Project Validation', () => {
  it('accepts valid project data', () => {
    const result = validateProjectCreate({
      name: 'My Project',
      description: 'A test project',
    });
    expect(result.name).toBe('My Project');
  });

  it('rejects missing name', () => {
    expect(() => validateProjectCreate({})).toThrow('Validation failed');
  });

  it('rejects empty name', () => {
    expect(() => validateProjectCreate({ name: '   ' })).toThrow('Validation failed');
  });
});
