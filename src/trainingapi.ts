// src/trainingapi.ts
import type { Training } from './types';

export const API_BASE_URL =
  'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

export async function getTrainings(): Promise<Training[]> {
  const res = await fetch(`${API_BASE_URL}/gettrainings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch trainings: ${res.status}`);
  }
  return (await res.json()) as Training[];
}

export async function deleteTraining(url: string): Promise<void> {
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`Failed to delete training: ${res.status}`);
  }
}

export async function deleteTrainingById(id: number | string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trainings/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete training id=${id}: ${res.status}`);
  }
}

// training: { date: ISO string, activity, duration, customer: customerUrl }
export async function addTraining(training: {
  date: string;
  activity: string;
  duration: number;
  customer: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/trainings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(training),
  });

  if (!res.ok) {
    throw new Error(`Failed to add training: ${res.status}`);
  }
}
