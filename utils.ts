import xlsx from "node-xlsx";
import fs from "fs";
// 数组去重
export const unique = (arr: any[]) => {
  return Array.from(new Set(arr));
};

// 从对象中获取所有的值
export const getAllwords = (langObj: any) => {
  let resList: any[] = [];
  for (var index in langObj) {
    const item = langObj[index];
    if (typeof item === "string") {
      resList.push(item);
    } else {
      resList = resList.concat(getAllwords(item));
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
    if (data.length > 0) {
      for (let i = 0; i < data[0].length; i++) {
        const name = data[0][i];
        resData.push({ name: name, data: [] });
      }
    } else {
      throw new Error("xlsx内格式不对");
    }
    for (let i = 1; i < data.length; i++) {
      for (let j = 0; j < resData.length; j++) {
        const word = data[i][j];
        resData[j]?.data?.push(word ? word : "");
      }
    }
    return resData;
  } catch (error) {
    throw new Error("读取xlsx错误，或者xlsx内格式不对");
  }
};

// 生成Excel文件的数据

export const getExportExcelData = (data: any) => {
  // console.log("data", data);
  let res: any = [];
  const titleRow: any[] = [];
  const dataList: any[] = [];
  data.forEach((v: any) => {
    titleRow.push(v?.name);
  });
  data[0].data.forEach((v: any, i: any) => {
    const tempItem: any[] = [];
    data.forEach((item: any, j: any) => {
      tempItem[j] = item?.data[i];
    });
    dataList.push(tempItem);
  });
  res.push(titleRow);
  res = res.concat(dataList);
  const resData = [{ name: "sheet1", data: res }];
  return resData;
};
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
