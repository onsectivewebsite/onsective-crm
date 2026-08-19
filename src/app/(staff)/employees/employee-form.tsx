"use client";

import { useActionState } from "react";
import { Department, EmploymentType, Role } from "@prisma/client";
import { Button, Field, inputClass } from "@/components/ui";
import { labelize } from "@/lib/format";
import { createEmployee } from "./actions";

export default function EmployeeForm({ managers }: { managers: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createEmployee, null);

  const values = state?.values ?? {};

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-3">
      <Field label="Full name">
        <input name="name" required className={inputClass} defaultValue={values.name ?? ""} />
      </Field>
      <Field label="Work email">
        <input name="email" type="email" required className={inputClass} defaultValue={values.email ?? ""} />
      </Field>
      <Field label="Temporary password">
        <input name="password" type="text" required minLength={8} className={inputClass} />
      </Field>
      <Field label="Job title">
        <input name="jobTitle" required className={inputClass} defaultValue={values.jobTitle ?? ""} />
      </Field>
      <Field label="Department">
        <select name="department" className={inputClass} defaultValue={values.department ?? Department.SEO}>
          {Object.values(Department).map((department) => (
            <option key={department} value={department}>
              {labelize(department)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="System role">
        <select name="role" className={inputClass} defaultValue={values.role ?? Role.EMPLOYEE}>
          {[Role.ADMIN, Role.MANAGER, Role.EMPLOYEE].map((role) => (
            <option key={role} value={role}>
              {labelize(role)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Employment type">
        <select name="employmentType" className={inputClass} defaultValue={values.employmentType ?? EmploymentType.FULL_TIME}>
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
        <input name="phone" className={inputClass} defaultValue={values.phone ?? ""} />
      </Field>
      <Field label="Annual salary (USD)">
        <input name="salary" type="number" min="0" step="1000" className={inputClass} defaultValue={values.salary ?? ""} />
      </Field>
      <Field label="Hire date">
        <input name="hireDate" type="date" className={inputClass} defaultValue={values.hireDate ?? ""} />
      </Field>
      <div className="md:col-span-3">
        {state && <p className="mb-2 text-sm text-rose-600">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add employee"}
        </Button>
      </div>
    </form>
  );
}
