import xlsx from "node-xlsx";
import fs from "fs";
import prettier from "prettier";

const prettierOptions = {
  singleQuote: true,
  semi: false,
};
// 数组去重
export const unique = (arr: any[]) => {
  return Array.from(new Set(arr));
};

// 从对象中获取所有的值
export const getAllwords = (langObj: any, parentKey = "") => {
  let resList: any[] = [];
  for (var index in langObj) {
    const item = langObj[index];
    if (typeof item === "string") {
      resList.push({ key: parentKey + "." + index, value: item });
    } else {
      resList = resList.concat(getAllwords(item, parentKey + "." + index));
    }
  }
  return resList;
};

// 读取主语言的文件
export const readFileList = (fullPath: any) => {
  return new Promise((resolve, reject) => {
    if (!fullPath) {
      reject();
    }
    import(fullPath).then((res) => {
      resolve(res);
    });
  });
};

// 读取Excel
export const getImportExcel = (importExcelPath: string) => {
  try {
    const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(importExcelPath));
    const data = workSheetsFromBuffer[0]?.data;
    const resData: any[] = [];
    if (data.length > 1) {
      for (let i = 1; i < data[0].length; i++) {
        const name = data[0][i];
        resData.push({ name: name, data: [] });
      }
    } else {
      throw new Error("xlsx内格式不对");
    }
    for (let i = 1; i < data.length; i++) {
      for (let j = 1; j <= resData.length; j++) {
        const word = data[i][j];
        resData[j - 1]?.data?.push({
          key: data[i][0],
          value: word ? word : "",
        });
      }
    }
    return resData;
  } catch (error) {
    throw new Error("读取xlsx错误，或者xlsx内格式不对");
  }
};

// 生成Excel文件的数据

export const getExportExcelData = (data: any) => {
  let res: any = [];
  const titleRow: any[] = [""];
  const dataList: any[] = [];
  data.forEach((v: any) => {
    titleRow.push(v?.name);
  });
  data[0].data.forEach((v: any, i: any) => {
    const tempItem: any[] = [v?.key];
    data.forEach((item: any, j: any) => {
      tempItem[j + 1] = item?.data[i]?.value;
    });
    dataList.push(tempItem);
  });
  res.push(titleRow);
  res = res.concat(dataList);
  const resData = [{ name: "sheet1", data: res }];
  return resData;
};

// 导出excel
export const writeExcel = (name: any, data: any) => {
  try {
    if (!fs.existsSync("./excel")) {
      fs.mkdirSync("./excel");
    }
    const buffer: any = xlsx.build(data);
    fs.writeFileSync("./excel/" + name + ".xlsx", buffer, { flag: "w" });
  } catch (error) {
    console.log(error);
  }
};

const replaceLang = (obj: any, originData: any, parentKey = "") => {
  const resObj = JSON.parse(JSON.stringify(obj));
  for (var index in resObj) {
    const item = resObj[index];
    if (typeof item === "string") {
      const findWord = originData.find((v: any) => {
        return v.key === parentKey + "." + index;
      });
      resObj[index] = findWord?.value;
    } else {
      resObj[index] = replaceLang(item, originData, parentKey + "." + index);
    }
  }
  return resObj;
};
// 多语言文件生成
export const generateJSFiles = (
  mainLang: any,
  importExcelData: any,
  outLang: any
) => {
  outLang?.forEach((v: any) => {
    const originData = importExcelData.find((item: any) => {
      console.log(item);
      return item?.name === v;
    })?.data;
    writeTs(v, replaceLang(mainLang, originData));
  });
};

// 生成ts
export const writeTs = (name: any, data: any) => {
  try {
    if (!fs.existsSync("./dist")) {
      fs.mkdirSync("./dist");
    }
    const scriptContent = `export default ${JSON.stringify(data)}`;
    const prettierContent = prettier.format(scriptContent, prettierOptions);
    fs.writeFileSync("./dist/" + name + ".ts", prettierContent);
  } catch (error) {
    console.log(error);
  }
};
