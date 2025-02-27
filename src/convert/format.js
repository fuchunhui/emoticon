import {splitArray} from '../utils/utils.js';

const COMMAND_LENGTH = 4;

const formatMenu = (data, title = '常用菜单') => {
  const list = data.map(item => {
    return `- ${item}`;
  });
  const content = `#### ${title}：\n` + list.join('\n');
  const menu = list.length ? content : `目前不存在 ${title} \n`;
  return menu;
};

const formatMultiMenu = (data, length) => {
  const source = data.sort().map(item => `• ${item} `);
  const list = splitArray(source, length);
  const menu = [];
  list.forEach(item => {
    menu.push(item.join(''));
  });
  return menu.join('\n');
};

const formatSeriesMenu = (name, data, command) => {
  const title = `固定参数参考：\`@${name} ${command} ${data[0]} 打工人\``;
  const menu = formatMenu(data, command);
  return `${title}\n${menu}`;
};

const warns = [
  '%E6%88%91%E8%AF%B4%E5%A4%A7%E5%93%A5%E4%BD%A0%E5%8D%83%E4%B8%87%E4%B8%8D%E8%A6%81%E8%83%A1%E6%9D%A5%E5%95%8A',
  '%E5%88%AB%E8%BF%99%E6%A0%B7%EF%BC%8C%E5%BE%88%E5%A4%9A%E4%BA%BA%E7%9C%8B%E7%9D%80%E5%91%A2',
  '%E6%88%91%E4%BB%AC%E4%B8%8D%E8%83%BD%E8%BF%99%E6%A0%B7%E5%81%9A%E7%9A%84%EF%BC%8C%E4%B8%8D%E5%8F%AF%E4%BB%A5',
  '%E5%BD%93%E5%89%8D%E6%B2%A1%E6%9C%89%E8%BF%99%E4%B8%AA%E6%8C%87%E4%BB%A4%EF%BC%8C%E7%9C%8B%E7%9C%8B%E8%8F%9C'
    + '%E5%8D%95',
  '%E5%AF%B9%E4%B8%8D%E8%B5%B7%EF%BC%8C%E6%88%91%E8%BF%98%E6%B2%A1%E6%9C%89%E5%87%86%E5%A4%87%E5%A5%BD%E6%9D%A5'
    + '%E8%A7%81%E4%BD%A0',
  '%E5%AF%B9%E4%B8%8D%E8%B5%B7%EF%BC%8C%E8%BF%99%E6%98%AF%E4%B8%80%E4%B8%AA%E6%97%A0%E6%95%88%E7%9A%84%E6%8C%87'
    + '%E4%BB%A4%E3%80%82',
  '%E8%BF%99%E4%B8%AA%E6%9C%AC%E9%A2%86%E6%88%91%E8%BF%98%E6%B2%A1%E6%9C%89%E5%AD%A6%E4%BC%9A%EF%BC%8C%E8%AF%B7'
    + '%E7%BB%99%E6%88%91%E7%82%B9%E6%97%B6%E9%97%B4',
  '%E6%88%91%E8%BF%98%E4%B8%8D%E8%83%BD%E8%BF%99%E6%A0%B7%E5%81%9A',
  '%E5%BE%88%E6%8A%B1%E6%AD%89%EF%BC%8C%E6%88%91%E8%BF%98%E6%B2%A1%E6%9C%89%E8%BF%99%E4%B8%AA%E6%8A%80%E8%83%BD',
  '%E8%B6%81%E6%88%91%E8%BF%98%E5%B9%B4%E8%BD%BB%EF%BC%8C%E6%88%91%E4%BC%9A%E5%8A%AA%E5%8A%9B%E7%9A%84'
];

const formatNull = (messages = warns) => {
  const index = Math.floor(Math.random() * messages.length);
  return decodeURIComponent(messages[index]);
};

const errors = [
  '%E5%A5%87%E6%80%AA%E7%9A%84%E4%BA%8B%E6%83%85%E5%8F%91%E7%94%9F%E4%BA%86%EF%BC%81%E6%88%91%E5%88%9A%E5%88%9A'
    + '%E8%B7%9F%E4%B8%BB%E5%AD%90%E8%AF%B4%EF%BC%9A%E2%80%9C%E6%88%91%E7%9A%84%E5%B7%B4%E6%8E%8C%E5%BE%88%E9%80'
    + '%82%E5%90%88%E4%BD%A0%E7%9A%84%E8%84%B8%E2%80%9D',
  '%E7%B3%9F%E7%B3%95%EF%BC%8C%E6%88%91%E5%87%BA%E7%8E%B0%E4%BA%86%E4%B8%80%E7%82%B9%E5%B0%8F%E6%AF%9B%E7%97%85'
    + '%EF%BC%81%E5%92%B1%E4%BB%AC%E5%85%88%E8%AF%95%E8%AF%95%E5%85%B6%E5%AE%83%E7%9A%84%E5%91%BD%E4%BB%A4',
  '%E4%B8%80%E5%AE%9A%E6%98%AF%E6%88%91%E5%A4%AA%E9%A5%BF%E4%BA%86%EF%BC%8C%E6%88%91%E9%9C%80%E8%A6%81%E5%81%9C'
    + '%E4%B8%8B%E6%9D%A5%E6%A3%80%E6%9F%A5%E4%B8%80%E4%B8%8B',
  '%E4%B8%8D%E7%99%BB%E9%AB%98%E5%B1%B1%EF%BC%8C%E4%B8%8D%E7%9F%A5%E5%A4%A9%E4%B9%8B%E9%AB%98%E4%B9%9F',
  '%E5%88%AB%E8%B7%9F%E4%B8%BB%E5%AD%90%E8%AF%B4%EF%BC%8C%E5%90%A6%E5%88%99%E6%88%91%E5%8F%88%E5%BE%97%E5%85%B3'
    + '%E7%A6%81%E9%97%AD%E5%95%A6',
  '%E6%98%A8%E5%A4%A9%E5%92%8C%E4%B8%BB%E5%AD%90%E5%96%9D%E9%85%B8%E5%A5%B6%EF%BC%8C%E8%BF%9E%E9%85%B8%E5%A5%B6'
    + '%E7%9B%96%E9%83%BD%E4%B8%8D%E7%BB%99%E6%88%91%EF%BC%8C%E7%BD%A2%E5%B7%A5%E7%BD%A2%E5%B7%A5',
  '%E5%98%BF%EF%BC%8C%E5%8D%83%E4%B8%87%E4%B8%8D%E8%A6%81%E5%91%8A%E8%AF%89%E7%8B%97...%E4%B8%BB%E5%AD%90%EF%BC'
    + '%8C%E5%90%A6%E5%88%99%E5%8F%88%E8%A6%81%E6%8C%A8%E6%8F%8D%E4%BA%86',
  '%E7%9C%9F%E6%8A%B1%E6%AD%89%EF%BC%8C%E6%9C%89%E4%BA%9B%E4%B8%8D%E5%A4%AA%E6%AD%A3%E5%B8%B8%EF%BC%8C%E6%88%91'
    + '%E5%BF%83%E9%87%8C%E4%BA%94%E5%91%B3%E6%9D%82%E9%99%88%EF%BC%8C%E9%9C%80%E8%A6%81%E5%A5%BD%E5%A5%BD%E5%8F'
    + '%8D%E6%80%9D%E8%87%AA%E5%B7%B1'
];

const formatError = () => {
  return formatNull(errors);
};

const formatHelp = ctx => {
  const {name, help} = ctx;
  let list = [
    '#### 我是一个<font color="red"> 斗图 </font>智障机器人',
    `- 菜单：\`@${name}\`，查询命令列表`,
    `- 动图：\`@${name} gif\`，查询 gif 动图命令列表`,
    `- 图片：\`@${name} image\`，以图片形式查询命令列表`,
    `- 上新：\`@${name} news\`，查询近期新增的命令列表`,
    `- 使用：\`@${name} 命令\`，获取原始表情`,
    `- 文字：\`@${name} 命令 文字\`，返回拼接文字的表情`,
    `- 参数：\`@${name} 命令 参数 文字\`，返回符合输入参数的文字表情`,
    `- 支持空格: 请使用双引号包裹文字内容，\`@${name} 命令 “这句话 是我说的”\``
  ];
  if (help.length) {
    list = list.concat(ctx.help);
  }

  return list.join('\n');
};

const formatAllMenu = (name, storyList, seniorList, seriesMap) => {
  const normal = formatMultiMenu(storyList, COMMAND_LENGTH);
  const senior = formatMultiMenu(seniorList, COMMAND_LENGTH);

  const seriesList = [];
  seriesMap.forEach((value, key) => {
    seriesList.push(`${key}(${value.join('/')})`);
  });
  const series = seriesList.map(item => `- ${item}`).join('\n');

  let content = [
    '#### 常用菜单：',
    `常规用法：\`@${name} 加油 打工人\``,
    normal
  ];
  if (senior.length) {
    content = content.concat([
      `高级用法：\`@${name} 上号 vscode 打工人\``,
      senior,
    ]);
  }
  if (series.length) {
    content = content.concat([
      `固定参数用法：\`@${name} 周报 张飞 打工人\``,
      series
    ]);
  }

  return content.join('\n');
};

const formatImageMenu = name => {
  return {
    title: '', // 为空，则不绘制标题
    normal: `常规用法举例：@${name} 加油 打工人`,
    senior: `高级用法举例：@${name} 上号 vscode 打工人`,
    series: `参数用法举例：@${name} 周报 张飞 打工人`
  };
};

const news = [
  '%E6%88%91%E6%9C%80%E8%BF%91%E5%81%B7%E6%87%92%E4%BA%86%EF%BC%8C%E8%BF%98%E6%B2%A1%E6%9C%89%E6%96%B0%E6'
    + '%8C%87%E4%BB%A4%EF%BC%8C%E8%AF%B7%E5%86%8D%E8%80%90%E5%BF%83%E7%AD%89%E7%AD%89',
  '%E4%BD%A0%E6%9C%89%E5%95%A5%E9%9C%80%E6%B1%82%EF%BC%8C%E5%8F%AF%E4%BB%A5%E9%9A%8F%E6%97%B6%E5%92%8C%E6'
    + '%88%91%E8%AE%B2%EF%BC%8C%E6%9C%80%E5%A5%BD%E6%98%AF%E5%86%99%E5%88%B0%E6%96%87%E6%A1%A3%E4%B8%AD'
];

const formatNewsMenu = commandList => {
  let content = '';
  if (commandList.length) {
    content = `#### 近期新增指令：<font color="green">${commandList.join('、')}</font>`;
  } else {
    content = formatNull(news);
  }
  return content;
};

const others = [
  '%E8%BF%99%E5%8F%AF%E8%83%BD%E4%B8%8D%E6%98%AF%E6%88%91%E7%9A%84%E5%8A%9F%E8%83%BD%EF%BC%8C%E4%BD%A0%E9%97%AE'
    + '%E9%97%AE%E5%8F%A6%E4%B8%80%E4%B8%AA%E5%91%86%E5%A4%B4%E5%91%86%E8%84%91%E7%9A%84%E5%AE%B6%E4%BC%99',
  '%E5%98%BF%EF%BC%8C%E4%BD%A0%E8%A6%81%E6%89%BE%E7%9A%84%E5%8F%AF%E8%83%BD%E4%B8%8D%E6%98%AF%E6%88%91',
  '%E7%9C%9F%E5%B8%8C%E6%9C%9B%E8%83%BD%E5%B8%AE%E5%88%B0%E6%82%A8%EF%BC%8C%E6%83%B3%E6%8A%B1%E5%A4%A7%E8%85%BF',
  '%E7%9C%9F%E6%98%AF%E9%9A%BE%E5%80%92%E6%88%91%E4%BA%86%EF%BC%8C%E9%97%AE%E9%97%AE%E5%8F%A6%E4%B8%80%E4%B8%AA'
    + '%E5%AE%B6%E4%BC%99'
];
const formatOther = () => {
  return formatNull(others);
};

const guides = [
  '%E4%BD%A0%E5%A5%BD%E5%83%8F%E8%BF%B7%E8%B7%AF%E4%BA%86%EF%BC%8C%E8%AF%95%E8%AF%95%60%40imeme%20help%60',
  '%E5%83%8F%E8%BF%99%E6%A0%B7%60%40imeme%60%E5%8F%AF%E4%BB%A5%E7%9C%8B%E7%9C%8B%E6%88%91%E4%BC%9A%E4%BB%80%E4%B9'
    + '%88%E6%9C%AC%E9%A2%86',
  '%E4%BD%A0%E5%96%9C%E6%AC%A2%E5%BC%80%E7%9B%B2%E7%9B%92%E5%90%97%EF%BC%8C%E6%88%91%E4%B9%9F%E4%BC%9A%60'
    + '%40imeme%20*%60'
];
const formatGuide = name => {
  const list = guides.map(item => item.replace(/imeme/g, name));
  return formatNull(list);
};

export {
  formatMenu,
  formatMultiMenu,
  formatSeriesMenu,
  formatAllMenu,
  formatImageMenu,
  formatNull,
  formatHelp,
  formatError,
  formatOther,
  formatGuide,
  formatNewsMenu
};
