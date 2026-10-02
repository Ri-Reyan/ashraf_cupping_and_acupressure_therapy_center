// Prisma queries for the clinic service catalog.
// Business validation and permissions belong to the service/action layers.
import "server-only";
import { prisma } from "@/lib/prisma";

export function listServices() {
  return prisma.orm.public.Service.orderBy((service) =>
    service.name.asc(),
  ).all();
}

export function findServiceByName(name: string) {
  return prisma.orm.public.Service.where({ name }).first();
}

export function findServiceById(id: string) {
  return prisma.orm.public.Service.where({ id }).first();
}

export function createServiceRecord(name: string) {
  return prisma.orm.public.Service.create({ name });
}

export function renameServiceRecord(id: string, name: string) {
  return prisma.orm.public.Service.where({ id }).update({ name });
}

export function deleteServiceRecord(id: string) {
  return prisma.orm.public.Service.where({ id }).delete();
}
