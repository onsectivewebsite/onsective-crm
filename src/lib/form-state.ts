export type FormState = { error: string; values: Record<string, string> } | null;

export function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    Array.from(formData.entries()).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string" && entry[0] !== "password",
    ),
  );
}
