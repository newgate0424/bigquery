import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getAllUsers() {
  return prisma.user.findMany();
}

export async function createUser(username: string, password: string, role: 'admin' | 'staff', teams?: string[]) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: { username, password: passwordHash, role, teams: teams || [] }
  });
}

export async function updateUser(id: number, data: Partial<{ username: string; password: string; role: string; teams: string[]; adserView: string[] }>) {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  // adserView และ teams จะถูกเก็บเป็น Json
  if (data.adserView) {
    (data as Record<string, unknown>).adserView = data.adserView;
  }
  if (data.teams) {
    (data as Record<string, unknown>).teams = data.teams;
  }
  return prisma.user.update({
    where: { id },
    data
  });
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } });
  return true;
}
