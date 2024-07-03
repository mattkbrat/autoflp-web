/home/matt/Documents/simplr2.db
import { Entity, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';

@Entity({ tableName: '__diesel_schema_migrations' })
export class DieselSchemaMigrations {

  [PrimaryKeyProp]?: 'version';

  @PrimaryKey()
  version!: string;

  @Property({ type: 'Date', defaultRaw: `CURRENT_TIMESTAMP` })
  runOn!: Date & Opt;

}


import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Person } from './Person.js';

@Entity()
export class Account {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Person, fieldName: 'contact', updateRule: 'cascade', deleteRule: 'cascade' })
  contact!: Person;

  @Property({ nullable: true })
  cosigner?: string;

  @Property({ nullable: true })
  dateOfBirth?: string;

  @Property()
  licenseNumber!: string;

  @Property({ nullable: true })
  licenseExpiration?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  dateAdded?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  dateModified?: string;

  @Property({ nullable: true })
  currentStanding?: string;

  @Property({ nullable: true })
  notes?: string;

}


import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Charge {

  @PrimaryKey()
  id!: string;

  @Property()
  name!: string;

  @Property()
  amount!: string;

  @Property()
  dateEffective!: string;

}


import { Entity, ManyToOne, type Opt, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { Person } from './Person.js';

@Entity()
@Unique({ name: 'unique_business_contact', properties: ['businessName', 'contact'] })
export class Creditor {

  @PrimaryKey()
  id!: string;

  @Property()
  businessName!: string;

  @ManyToOne({ entity: () => Person, fieldName: 'contact', updateRule: 'cascade', deleteRule: 'cascade' })
  contact!: Person;

  @Property()
  filingFees!: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  dateAdded?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  dateModified?: string;

  @Property({ type: 'string', defaultRaw: `"10"` })
  apr!: string & Opt;

}


import { Entity, ManyToOne, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Account } from './Account.js';
import { Creditor } from './Creditor.js';
import { Inventory } from './Inventory.js';

@Entity()
export class Deal {

  @PrimaryKey()
  id!: string;

  @Property({ type: 'number' })
  state: number & Opt = 1;

  @Property()
  date!: string;

  @ManyToOne({ entity: () => Account, fieldName: 'account', updateRule: 'cascade', deleteRule: 'cascade' })
  account!: Account;

  @ManyToOne({ entity: () => Inventory, fieldName: 'inventory', updateRule: 'cascade', deleteRule: 'cascade', index: 'vin' })
  inventory!: Inventory;

  @ManyToOne({ entity: () => Creditor, fieldName: 'creditor', updateRule: 'set null', deleteRule: 'cascade', nullable: true })
  creditor?: Creditor;

  @Property()
  cash!: string;

  @Property({ nullable: true, defaultRaw: `0` })
  down?: string;

  @Property()
  apr!: string;

  @Property({ nullable: true })
  finance?: string;

  @Property({ nullable: true })
  lien?: string;

  @Property({ nullable: true })
  pmt?: string;

  @Property()
  term!: string;

  @Property({ nullable: true })
  taxCity?: string;

  @Property({ nullable: true })
  taxState?: string;

  @Property({ nullable: true })
  taxCounty?: string;

  @Property({ nullable: true })
  taxRtd?: string;

}


import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Charge } from './Charge.js';
import { Deal } from './Deal.js';

@Entity()
export class DealCharge {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Deal, fieldName: 'deal', updateRule: 'cascade', deleteRule: 'cascade', nullable: true })
  deal?: Deal;

  @ManyToOne({ entity: () => Charge, fieldName: 'charge', updateRule: 'cascade', deleteRule: 'cascade', nullable: true })
  charge?: Charge;

  @Property({ nullable: true })
  date?: string;

  @Property({ nullable: true })
  note?: string;

}


import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { Deal } from './Deal.js';
import { Salesman } from './Salesman.js';

@Entity()
export class DealSalesman {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Deal, fieldName: 'deal', updateRule: 'cascade', deleteRule: 'cascade' })
  deal!: Deal;

  @ManyToOne({ entity: () => Salesman, fieldName: 'salesman', updateRule: 'cascade', deleteRule: 'cascade' })
  salesman!: Salesman;

}


import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Deal } from './Deal.js';
import { Inventory } from './Inventory.js';

@Entity()
export class DealTrade {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Deal, fieldName: 'deal', updateRule: 'cascade', deleteRule: 'cascade' })
  deal!: Deal;

  @ManyToOne({ entity: () => Inventory, fieldName: 'vin', updateRule: 'cascade', deleteRule: 'cascade' })
  vin!: Inventory;

  @Property()
  value!: string;

}


import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { Charge } from './Charge.js';
import { Creditor } from './Creditor.js';

@Entity()
export class DefaultCharge {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Creditor, fieldName: 'creditor', updateRule: 'cascade', deleteRule: 'cascade' })
  creditor!: Creditor;

  @ManyToOne({ entity: () => Charge, fieldName: 'charge', updateRule: 'cascade', deleteRule: 'cascade' })
  charge!: Charge;

}


import { Entity, type Opt, PrimaryKey, PrimaryKeyProp, Property } from '@mikro-orm/core';

@Entity()
export class Inventory {

  [PrimaryKeyProp]?: 'vin';

  @PrimaryKey()
  vin!: string;

  @Property()
  id!: string;

  @Property()
  year!: string;

  @Property()
  make!: string;

  @Property({ nullable: true })
  model?: string;

  @Property({ nullable: true })
  body?: string;

  @Property({ nullable: true })
  color?: string;

  @Property({ nullable: true })
  fuel?: string;

  @Property({ nullable: true })
  cwt?: string;

  @Property({ nullable: true })
  mileage?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  dateAdded?: string;

  @Property({ nullable: true, defaultRaw: `CURRENT_TIMESTAMP` })
  dateModified?: string;

  @Property({ nullable: true })
  picture?: string;

  @Property({ nullable: true })
  cash?: string;

  @Property({ nullable: true })
  credit?: string;

  @Property({ nullable: true })
  down?: string;

  @Property({ type: 'number' })
  state: number & Opt = 1;

}


import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
@Unique({ name: 'key_key_business_uindex', properties: ['key', 'business'] })
export class Key {

  @Unique({ name: 'key_id_uindex' })
  @PrimaryKey({ nullable: true })
  id?: string;

  @Property()
  key!: string;

  @Property()
  value!: string;

  @Property()
  business!: string;

}


import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './User.js';

@Entity()
export class LoginKey {

  @Unique({ name: 'key_id_key' })
  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  hashedPassword?: string;

  @ManyToOne({ entity: () => User, updateRule: 'cascade', deleteRule: 'cascade', index: 'key_user_id_idx' })
  user!: User;

}


import { Entity, ManyToOne, type Opt, PrimaryKey, Property } from '@mikro-orm/core';
import { Deal } from './Deal.js';

@Entity()
export class Payment {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Deal, fieldName: 'deal', updateRule: 'cascade', deleteRule: 'cascade' })
  deal!: Deal;

  @Property({ type: 'string', defaultRaw: `CURRENT_TIMESTAMP` })
  date!: string & Opt;

  @Property()
  amount!: string;

}


import { Entity, type Opt, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Person {

  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  namePrefix?: string;

  @Property()
  firstName!: string;

  @Property({ nullable: true })
  middleInitial?: string;

  @Property()
  lastName!: string;

  @Property({ nullable: true })
  nameSuffix?: string;

  @Property({ fieldName: 'address_1' })
  address1!: string;

  @Property({ fieldName: 'address_2', nullable: true })
  address2?: string;

  @Property({ fieldName: 'address_3', nullable: true })
  address3?: string;

  @Property({ type: 'string' })
  city: string & Opt = 'Fort Morgan';

  @Property({ type: 'string' })
  stateProvince: string & Opt = 'CO';

  @Property({ type: 'string', defaultRaw: `80701` })
  zipPostal!: string & Opt;

  @Property({ fieldName: 'zip_4', nullable: true })
  zip4?: string;

  @Property({ type: 'string' })
  country: string & Opt = 'US';

  @Property()
  phonePrimary!: string;

  @Property({ nullable: true })
  phoneSecondary?: string;

  @Property({ nullable: true })
  phoneTertiary?: string;

  @Property({ nullable: true })
  emailPrimary?: string;

  @Property({ nullable: true })
  emailSecondary?: string;

}


import { Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { Person } from './Person.js';

@Entity()
export class Salesman {

  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => Person, fieldName: 'person', updateRule: 'cascade' })
  person!: Person;

}


import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './User.js';

@Entity()
export class Session {

  @Unique({ name: 'session_id_key' })
  @PrimaryKey()
  id!: string;

  @ManyToOne({ entity: () => User, updateRule: 'cascade', deleteRule: 'cascade', index: 'session_user_id_idx' })
  user!: User;

  @Property()
  activeExpires!: bigint;

  @Property()
  idleExpires!: bigint;

  @Property({ nullable: true })
  iv?: string;

}


import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';

@Entity()
export class User {

  @PrimaryKey()
  id!: string;

  @Unique({ name: 'user_username_key' })
  @Property()
  username!: string;

  @Unique({ name: 'user_email_key' })
  @Property()
  email!: string;

}

