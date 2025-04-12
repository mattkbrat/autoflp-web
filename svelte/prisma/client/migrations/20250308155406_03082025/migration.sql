-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "contact" TEXT NOT NULL,
    "date_of_birth" TEXT,
    "license_number" TEXT NOT NULL,
    "license_expiration" TEXT,
    "date_added" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "date_modified" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "current_standing" TEXT,
    "notes" TEXT,
    CONSTRAINT "account_contact_fkey" FOREIGN KEY ("contact") REFERENCES "person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "charge" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "name" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "date_effective" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "creditor" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "business_name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "filing_fees" TEXT NOT NULL,
    "date_added" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "date_modified" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "apr" TEXT NOT NULL DEFAULT '10',
    CONSTRAINT "creditor_contact_fkey" FOREIGN KEY ("contact") REFERENCES "person" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deal" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "state" INTEGER NOT NULL DEFAULT 1,
    "date" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "inventory" TEXT NOT NULL,
    "creditor" TEXT,
    "cash" TEXT NOT NULL,
    "down" TEXT DEFAULT '0',
    "down_owed" TEXT NOT NULL DEFAULT '0',
    "apr" TEXT NOT NULL,
    "finance" TEXT,
    "lien" TEXT,
    "pmt" TEXT,
    "term" TEXT NOT NULL,
    "tax_city" TEXT,
    "tax_state" TEXT,
    "tax_county" TEXT,
    "tax_rtd" TEXT,
    "cosigner" TEXT,
    CONSTRAINT "deal_creditor_fkey" FOREIGN KEY ("creditor") REFERENCES "creditor" ("id") ON DELETE CASCADE ON UPDATE SET NULL,
    CONSTRAINT "deal_inventory_fkey" FOREIGN KEY ("inventory") REFERENCES "inventory" ("vin") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deal_account_fkey" FOREIGN KEY ("account") REFERENCES "account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deal_charge" (
    "deal" TEXT,
    "charge" TEXT,
    "date" TEXT,
    "note" TEXT,
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    CONSTRAINT "deal_charge_charge_fkey" FOREIGN KEY ("charge") REFERENCES "charge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deal_charge_deal_fkey" FOREIGN KEY ("deal") REFERENCES "deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deal_trade" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "deal" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "deal_trade_vin_fkey" FOREIGN KEY ("vin") REFERENCES "inventory" ("vin") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deal_trade_deal_fkey" FOREIGN KEY ("deal") REFERENCES "deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "default_charge" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "creditor" TEXT NOT NULL,
    "charge" TEXT NOT NULL,
    CONSTRAINT "default_charge_charge_fkey" FOREIGN KEY ("charge") REFERENCES "charge" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "default_charge_creditor_fkey" FOREIGN KEY ("creditor") REFERENCES "creditor" ("business_name") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "vin" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT,
    "body" TEXT,
    "color" TEXT,
    "fuel" TEXT,
    "cwt" TEXT,
    "mileage" TEXT,
    "date_added" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "date_modified" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "date_purchased" TEXT DEFAULT 'CURRENT_TIMESTAMP',
    "picture" TEXT,
    "cash" TEXT,
    "credit" TEXT,
    "down" TEXT,
    "purchase_price" TEXT,
    "state" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "deal" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
    "amount" TEXT NOT NULL,
    CONSTRAINT "payment_deal_fkey" FOREIGN KEY ("deal") REFERENCES "deal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "person" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "name_prefix" TEXT,
    "first_name" TEXT NOT NULL,
    "middle_initial" TEXT,
    "last_name" TEXT NOT NULL,
    "name_suffix" TEXT,
    "address_1" TEXT NOT NULL,
    "address_2" TEXT,
    "address_3" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Fort Morgan',
    "state_province" TEXT NOT NULL DEFAULT 'CO',
    "zip_postal" TEXT NOT NULL DEFAULT '80701',
    "zip_4" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "phone_primary" TEXT NOT NULL,
    "phone_secondary" TEXT,
    "phone_tertiary" TEXT,
    "email_primary" TEXT,
    "email_secondary" TEXT
);

-- CreateTable
CREATE TABLE "salesman" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "person" TEXT NOT NULL,
    "state" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "salesman_person_fkey" FOREIGN KEY ("person") REFERENCES "person" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

-- CreateTable
CREATE TABLE "key" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "k" TEXT NOT NULL,
    "v" TEXT NOT NULL,
    "business" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "inventory_salesman" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'lower(hex(randomblob(4))) || ''-'' || lower(hex(randomblob(2))) || ''-4'' || substr(lower(hex(randomblob(2))),2) || ''-'' || substr(''89ab'',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || ''-'' || lower(hex(randomblob(6)))',
    "vin" TEXT NOT NULL,
    "salesman" TEXT NOT NULL,
    CONSTRAINT "inventory_salesman_salesman_fkey" FOREIGN KEY ("salesman") REFERENCES "salesman" ("person") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_salesman_vin_fkey" FOREIGN KEY ("vin") REFERENCES "inventory" ("vin") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_account_2" ON "account"("contact");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_account_3" ON "account"("license_number");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_charge_2" ON "charge"("name", "amount");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_creditor_2" ON "creditor"("business_name");
Pragma writable_schema=0;

-- CreateIndex
CREATE UNIQUE INDEX "unique_business_contact" ON "creditor"("business_name", "contact");

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_deal_2" ON "deal"("date", "account", "inventory");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_deal_trade_2" ON "deal_trade"("deal", "vin");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_default_charge_2" ON "default_charge"("creditor", "charge");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_inventory_2" ON "inventory"("vin");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_payment_2" ON "payment"("deal", "date", "amount");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_person_2" ON "person"("last_name", "first_name", "address_1");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_salesman_2" ON "salesman"("person");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_key_2" ON "key"("k", "business");
Pragma writable_schema=0;

-- CreateIndex
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_inventory_salesman_2" ON "inventory_salesman"("vin", "salesman");
Pragma writable_schema=0;
