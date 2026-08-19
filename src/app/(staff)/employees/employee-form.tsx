"use client";

import { useActionState } from "react";
import { Department, EmploymentType, Role } from "@prisma/client";
import { Button, Field, inputClass } from "@/components/ui";
import { labelize } from "@/lib/format";
import { createEmployee } from "./actions";

export default function EmployeeForm({ managers }: { managers: { id: string; name: string }[] }) {
  const [error, formAction, pending] = useActionState(createEmployee, null);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-3">
      <Field label="Full name">
        <input name="name" required className={inputClass} />
      </Field>
      <Field label="Work email">
        <input name="email" type="email" required className={inputClass} />
      </Field>
      <Field label="Temporary password">
        <input name="password" type="text" required minLength={8} className={inputClass} />
      </Field>
      <Field label="Job title">
        <input name="jobTitle" required className={inputClass} />
      </Field>
      <Field label="Department">
        <select name="department" className={inputClass} defaultValue={Department.SEO}>
          {Object.values(Department).map((department) => (
            <option key={department} value={department}>
              {labelize(department)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="System role">
        <select name="role" className={inputClass} defaultValue={Role.EMPLOYEE}>
          {[Role.ADMIN, Role.MANAGER, Role.EMPLOYEE].map((role) => (
            <option key={role} value={role}>
              {labelize(role)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Employment type">
        <select name="employmentType" className={inputClass} defaultValue={EmploymentType.FULL_TIME}>
          {Object.values(EmploymentType).map((type) => (
            <option key={type} value={type}>
              {labelize(type)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Reports to">
        <select name="managerId" className={inputClass} defaultValue="">
          <option value="">No manager</option>
          {managers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Phone">
        <input name="phone" className={inputClass} />
      </Field>
      <Field label="Annual salary (USD)">
        <input name="salary" type="number" min="0" step="1000" className={inputClass} />
      </Field>
      <Field label="Hire date">
        <input name="hireDate" type="date" className={inputClass} />
      </Field>
      <div className="md:col-span-3">
        {error && <p className="mb-2 text-sm text-rose-600">{error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}
