// 获取多语言文件夹内容根据目录返回json
import * as config from "./generate-lang-config.json";
import {
  generateJSFiles,
  getAllwords,
  getExportExcelData,
  getImportExcel,
  readFileList,
  unique,
  writeExcel,
} from "./utils";

const main = async () => {
  if (!config) {
    throw new Error("缺少generate-lang-config.json配置文件");
  }
  // 读取ts文件
  const mainLang: any = await readFileList(config?.mainLangPath);
  // 获取所有单词
  const allword = getAllwords(mainLang?.default);
  const originData = { name: "zh-CN", data: allword };
  // 读取导入的Excel,没有则为空数组
  let importExcelData: any[] = [];
  if (config?.importExcel) {
    const outData = getImportExcel(config?.importExcel);
    importExcelData = outData.map((v) => {
      return v?.name === "zh-CN" ? originData : v;
    });
  } else {
    importExcelData = [
      originData,
      ...config?.outLang.map((v) => {
        return { name: v, data: [] };
      }),
    ];
  }
  // 生成I18N文件
  generateJSFiles(mainLang?.default, importExcelData, config.outLang);
  // // 导出excel
  writeExcel("I18N", getExportExcelData(importExcelData));
};

main();
