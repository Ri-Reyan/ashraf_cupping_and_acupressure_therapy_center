// Owns service-catalog naming and existence rules.
// Repository calls below are the only database access in this feature layer.
import "server-only";
import {
  createServiceRecord,
  deleteServiceRecord,
  findServiceById,
  findServiceByName,
  renameServiceRecord,
} from "./repository";

export class ServiceRuleError extends Error {
  constructor(readonly code: "NOT_FOUND" | "NAME_TAKEN") {
    super(code);
  }
}

export async function createService(name: string) {
  if (await findServiceByName(name)) {
    throw new ServiceRuleError("NAME_TAKEN");
  }
  return createServiceRecord(name);
}

export async function renameService(id: string, name: string) {
  const current = await findServiceById(id);
  if (!current) throw new ServiceRuleError("NOT_FOUND");

  const duplicate = await findServiceByName(name);
  if (duplicate && duplicate.id !== id) {
    throw new ServiceRuleError("NAME_TAKEN");
  }

  return renameServiceRecord(id, name);
}

export async function deleteService(id: string) {
  if (!(await findServiceById(id))) {
    throw new ServiceRuleError("NOT_FOUND");
  }
  await deleteServiceRecord(id);
}
