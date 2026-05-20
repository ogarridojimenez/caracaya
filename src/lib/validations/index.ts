import { z } from 'zod';
import { NextResponse } from 'next/server';

export { z };

export async function validateBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return {
        success: false,
        error: NextResponse.json({ error: `Validation failed: ${message}` }, { status: 400 }),
      };
    }
    return {
      success: false,
      error: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }),
    };
  }
}

export * from './product';
export * from './order';
export * from './category';
export * from './auth';
export * from './daily-close';