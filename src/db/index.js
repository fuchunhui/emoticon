import * as fs from 'fs';
import initSqlJs from 'sql.js';
import {getMid} from '../utils/keys.js';
import {config} from '../config/index.js';

export const STORY_TABLE = 'STORY';
export const TEXT_TABLE = 'TEXT';
export const SERIES_TABLE = 'SERIES';
export const FEATURE_TABLE = 'FEATURE';
export const MYSTERY_TABLE = 'MYSTERY';
export const MATERIAL_TABLE = 'MATERIAL';
export const SPECIAL_TABLE = 'SPECIAL';
export const LOG_TABLE = 'LOGGER';
export const ADDITIONAL_TABLE = 'ADDITIONAL';
export const GIF_TABLE = 'GIF';

export const FEATURE_TYPE = {
  'COMMAND': 'COMMAND',
  'TEXT': 'TEXT',
  'IMAGE': 'IMAGE',
  'REPEAT': 'REPEAT'
};
export const FEATURE_SOURCE_NAME = {
  'COMMON': STORY_TABLE,
  'SPECIAL': SPECIAL_TABLE,
  'SERIES': SERIES_TABLE
};
export const FEATURE_IMAGE_TYPE = {
  'SVG': 'SVG',
  'PNG': 'PNG',
  'DB': 'DB',
  'RANDOM': 'RANDOM'
};

const SQL = await initSqlJs({
  locateFile: file => `./public/db/${file}`
});
const MEME_DB_PATH = './public/db/meme.db'; // default db path
const meme_buffer = fs.readFileSync(MEME_DB_PATH);
const meme_db = new SQL.Database(new Uint8Array(meme_buffer));

const DB_MAP = {
  'meme': {
    'db': meme_db,
    'path': MEME_DB_PATH
  }
};

config.forEach(({path}) => {
  if (path === 'meme') {
    return;
  }

  const DB_PATH = `./public/db/${path}.db`;
  const buffer = fs.readFileSync(DB_PATH);
  const db = new SQL.Database(new Uint8Array(buffer));
  DB_MAP[path] = {
    'db': db,
    'path': DB_PATH
  };
});

const getDB = (path = 'meme') => {
  const db = path ? DB_MAP[path].db : meme_db;
  return db;
};

const writeDB = (path = 'meme') => {
  const data = getDB(path).export();
  const buffer = new Uint8Array(data);
  fs.writeFileSync(DB_MAP[path].path, buffer);
};

const queryAllTables = ctx => {
  return getDB(ctx.path).exec('SELECT name, sql FROM sqlite_master;');
};

const getTable = (tableName = STORY_TABLE, join = true, ctx) => {
  const contents = [];
  const sqlplus = join ? ` INNER JOIN ${TEXT_TABLE} USING(mid)` : '';
  const stmt = getDB(ctx.path).prepare(`SELECT * FROM ${tableName}${sqlplus};`);
  while (stmt.step()) {
    const cell = stmt.getAsObject();
    contents.push(cell);
  }
  stmt.free();
  return contents;
};

const insertTable = (options, write = true, tableName = STORY_TABLE, ctx) => {
  const {mid: _mid, title, feature, image, senior = 0, x = 0, y = 0, max = 100, font = '32px sans-serif',
    color = 'black', align = 'start', direction = 'down', blur = 0, degree = 0, stroke = 'transparent',
    swidth = 1} = options;
  const mid = getMid(_mid);

  const sql = `INSERT INTO ${tableName} (mid, title, feature, image, senior) `
    + `VALUES ('${mid}', '${title}', '${feature}', '${image}', '${senior}');`;
  const text = `INSERT INTO ${TEXT_TABLE} `
    + `(mid, x, y, max, font, color, align, direction, blur, degree, stroke, swidth) `
    + `VALUES ('${mid}', ${x}, ${y}, ${max}, '${font}', '${color}', '${align}', '${direction}', `
    + `${blur}, ${degree}, '${stroke}', ${swidth});`;

  try {
    getDB(ctx.path).run(sql + text);
    write && writeDB(ctx.path);
    return {
      error: false,
      data: mid
    };
  } catch (error) {
    return {
      error: true,
      data: error.toString()
    };
  }
};

const updateTable = (options, tableName = STORY_TABLE, ctx) => {
  const {mid, title, feature, image} = options;
  const sql = `UPDATE ${tableName} SET title = '${title}', feature = '${feature}', image = '${image}' WHERE mid = '${mid}';`;

  try {
    getDB(ctx.path).run(sql);
    writeDB(ctx.path);
  } catch (error) {
    return error.toString();
  }
};

const updateTextTable = (options, ctx) => {
  const {mid, x = 0, y = 0, max = 100, font = '32px sans-serif', color = 'black', align = 'start',
    direction = 'down', blur = 0, degree = 0, stroke = 'transparent', swidth = 1} = options;
  const text = `UPDATE ${TEXT_TABLE} SET x = ${x}, y = ${y}, max = ${max}, font = '${font}',`
    + ` color = '${color}', align = '${align}', direction = '${direction}', blur = ${blur},`
    + ` degree = ${degree}, stroke = '${stroke}', swidth = ${swidth} WHERE mid = '${mid}';`;
  try {
    getDB(ctx.path).run(text);

    writeDB(ctx.path);
  } catch (error) {
    return error.toString();
  }
};

const deleteTable = (like, ctx) => {
  const text = `DELETE FROM ${TEXT_TABLE} WHERE mid in `
    + `(SELECT mid FROM ${STORY_TABLE} WHERE title NOT LIKE '${like}');`;
  const sql = `DELETE FROM ${STORY_TABLE} WHERE title NOT LIKE '${like}';`;
  getDB(ctx.path).run(text);
  getDB(ctx.path).run(sql);

  writeDB(ctx.path);
};

const getDataByColumn = (value, column = 'title', name = STORY_TABLE, ctx) => {
  const stmt = getDB(ctx.path).prepare(`SELECT * FROM ${name} INNER JOIN ${TEXT_TABLE} USING(mid) WHERE ${column} = :val`);
  const result = stmt.getAsObject({':val': value});
  stmt.free();
  return result;
};

const getDataListByColumn = (value, column = 'title', name = STORY_TABLE, ctx) => {
  const contents = [];
  const stmt = getDB(ctx.path).prepare(`SELECT * FROM ${name} WHERE ${column} = '${value}'`);
  while (stmt.step()) {
    const cell = stmt.getAsObject();
    contents.push(cell);
  }
  stmt.free();
  return contents;
};

const insertLog = ({fromid, text, date, ctx}, write = true) => {
  const sql = `INSERT INTO ${LOG_TABLE} (fromid, text, date) VALUES ('${fromid}', '${text}', '${date}');`;
  getDB(ctx.path).run(sql);

  write && writeDB(ctx.path);
};

const getColumnByTable = (value, column, table, ctx) => {
  const stmt = getDB(ctx.path).prepare(`SELECT * FROM ${table} WHERE ${column} = :val`);
  const result = stmt.getAsObject({':val': value});
  stmt.free();
  return result;
};

const getSpecialDataListByColumn = (value, column = 'feature', ctx) => {
  const contents = [];
  const stmt = getDB(ctx.path).prepare(`SELECT * FROM ${SPECIAL_TABLE} INNER JOIN ${TEXT_TABLE} USING(mid) WHERE ${column} = '${value}'`);
  while (stmt.step()) {
    const cell = stmt.getAsObject();
    contents.push(cell);
  }
  stmt.free();
  return contents;
};

const updateFeatureTable = (options, ctx) => {
  const list = [];
  Object.keys(options).forEach(key => {
    if (key === 'mid') {
      return;
    }
    const value = options[key];
    const realValue = typeof value === 'string' ? `'${value}'` : value;
    list.push(`${key}=${realValue}`);
  });

  const append = list.join(', ');
  const sql = `UPDATE ${FEATURE_TABLE} SET ${append} WHERE mid = '${options.mid}';`;

  try {
    getDB(ctx.path).run(sql);

    writeDB(ctx.path);
  } catch (error) {
    return error.toString();
  }
};

const getSingleTable = (tableName = STORY_TABLE, ctx) => {
  const contents = [];
  const stmt = getDB(ctx.path).prepare(`SELECT * FROM ${tableName};`);
  while (stmt.step()) {
    const cell = stmt.getAsObject();
    contents.push(cell);
  }
  stmt.free();
  return contents;
};

const getNamedColumnFromTable = (tableName = MATERIAL_TABLE, columns = [], ctx) => {
  const columnSQL = columns.length ? columns.join(', ') : '*';
  const sql = `SELECT ${columnSQL} FROM ${tableName};`;
  return _getDataFromTable(sql, ctx);
};

const _getDataFromTable = (sql, ctx) => {
  const contents = [];
  const stmt = getDB(ctx.path).prepare(sql);
  while (stmt.step()) {
    const cell = stmt.getAsObject();
    contents.push(cell);
  }
  stmt.free();
  return contents;
};

const getRandom = (tableName = MYSTERY_TABLE, columns = [], condition = '', ctx) => {
  const expression = condition ? `where ${condition}` : '';

  const column = typeof columns === 'string'
    ? columns
    : columns.length
      ? columns.length > 1 ? columns.join(', ') : columns[0]
      : '*';
  const sql = `SELECT ${column} FROM ${tableName} ${expression} ORDER BY RANDOM() limit 1`;
  const stmt = getDB(ctx.path).prepare(sql);
  const result = stmt.getAsObject({});
  stmt.free();
  return result;
};

const updateAdditionalTable = (options, ctx) => {
  const {mid, text} = options;
  const sql = `UPDATE ${ADDITIONAL_TABLE} SET text = '${text}' WHERE mid = '${mid}';`;

  try {
    getDB(ctx.path).run(sql);
    writeDB(ctx.path);
  } catch (error) {
    return error.toString();
  }
};

const getGifTable = () => {
 // ...
};

const updateGifTable = (options, ctx) => {
  const {mid, x = 0, y = 0, max = 100, font = '32px sans-serif', color = 'black', align = 'start', direction = 'down',
    stroke = 'transparent', swidth = 1, frame = 'NORMAL'} = options;
  const sql = `UPDATE ${GIF_TABLE} SET x = ${x}, y = ${y}, max = ${max}, font = '${font}', `
    + `color = '${color}', align = '${align}', direction = '${direction}', stroke = '${stroke}', `
    + `swidth = ${swidth}, frame = '${frame}' WHERE mid = '${mid}';`;
  try {
    getDB(ctx.path).run(sql);
    writeDB(ctx.path);
  } catch (error) {
    return error.toString();
  }
};

const insertGifTable = (options, ctx) => {
  const {mid: _mid, title, image, x = 0, y = 0, max = 100, font = '32px sans-serif', color = 'black', align = 'start',
    direction = 'down', stroke = 'transparent', swidth = 1, frame = 'NORMAL'} = options;
  const mid = getMid(_mid);

  const sql = `INSERT INTO ${GIF_TABLE} (mid, title, image, x, y, max, font, color, align, direction, stroke, `
    + `swidth, frame) VALUES ('${mid}', '${title}', '${image}', ${x}, ${y}, ${max}, '${font}', '${color}', `
    + `'${align}', '${direction}', '${stroke}', ${swidth}, '${frame}');`;

  try {
    getDB(ctx.path).run(sql);
    writeDB(ctx.path);
    return {
      error: false,
      data: mid
    };
  } catch (error) {
    return {
      error: true,
      data: error.toString()
    };
  }
};

const updateGifBaseTable = (options, ctx) => {
  const {mid, title} = options;
  const sql = `UPDATE ${GIF_TABLE} SET title = '${title}' WHERE mid = '${mid}';`;
  try {
    getDB(ctx.path).run(sql);

    writeDB(ctx.path);
  } catch (error) {
    return error.toString();
  }
};

export {
  writeDB,
  getDB,
  queryAllTables,
  getTable,
  insertTable,
  updateTable,
  deleteTable,
  getDataByColumn,
  getColumnByTable,
  getDataListByColumn,
  getSpecialDataListByColumn,
  updateTextTable,
  insertLog,
  getSingleTable,
  updateFeatureTable,
  getNamedColumnFromTable,
  getRandom,
  updateAdditionalTable,
  getGifTable,
  updateGifTable,
  insertGifTable,
  updateGifBaseTable
};
