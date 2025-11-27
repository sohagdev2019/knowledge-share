# Keeping Database & Prisma Schema In Sync (Without Resetting Data)

When you add a new field to an existing Prisma model (or make other schema changes) but the database already has live data, you **don’t** need to run `prisma migrate reset`. Instead, follow the checklist below to extend the schema safely.

---

## 1. Generate a Prisma Migration Immediately

Whenever `prisma/schema.prisma` changes, create a migration right away:

```bash
pnpm prisma migrate dev --name <descriptive-name>
```

This writes the SQL needed to move from the previous schema to the new one. Running it early prevents drift.

---

## 2. If Drift Already Exists (e.g., column missing), Patch the DB Manually

Sometimes the DB schema falls behind because fields were added without applying a migration. To fix that without deleting data:

1. **Inspect the current schema** (e.g., via Prisma Studio, your SQL client, or `pnpm prisma db pull` into a temporary file).
2. **Add the missing columns manually** with SQL that matches the new Prisma fields. Example:

   ```sql
   ALTER TABLE "user"
     ADD COLUMN "socialWebsite" TEXT,
     ADD COLUMN "socialGithub" TEXT,
     ADD COLUMN "socialFacebook" TEXT,
     ADD COLUMN "socialTwitter" TEXT,
     ADD COLUMN "socialLinkedin" TEXT;
   ```

3. After the DB structure matches `schema.prisma`, run `pnpm prisma generate`.
4. Finally, create a migration so the history stays correct (see tip below).

---

## 3. Use `prisma migrate diff` to Generate SQL Patches

Prisma can produce the SQL required to go from the current DB to the new schema without touching data:

```bash
pnpm prisma migrate diff \
  --from-schema-datasource <path-to-current-db-schema> \
  --to-schema-datamodel ./prisma/schema.prisma \
  --script > patch.sql
```

Review `patch.sql`, apply it to the DB (e.g., via `psql` or your SQL UI), then run `pnpm prisma generate`.

> **Tip:** If you just need a migration file without applying it locally, use `pnpm prisma migrate dev --create-only`.

---

## 4. Keep the Migration History Honest

Even if you patched the DB manually, **create a Prisma migration** afterward so future `prisma migrate dev` runs don’t complain about drift:

```bash
pnpm prisma migrate dev --name sync-existing-db
```

If the migration is already applied in the DB, Prisma marks it as applied immediately.

---

## 5. Summary Workflow When Adding a Field

1. Edit `prisma/schema.prisma`.
2. Run `pnpm prisma migrate dev --name add-<field>` (preferred).
3. If the DB was out of sync, either:
   - Manually `ALTER TABLE` to add the field(s), or
   - Generate SQL with `prisma migrate diff` and apply it.
4. Run `pnpm prisma generate`.
5. Verify the UI/API reads/writes the new column.

Following this flow lets you evolve the schema without wiping existing data.

--- 

