/*
 * @Author: cathylee 447932704@qq.com
 * @Date: 2023-05-21 09:55:04
 * @LastEditors: cathylee 447932704@qq.com
 * @LastEditTime: 2023-05-29 21:48:46
 * @FilePath: /loadFile/client/public/hash.js
 * @Description:
 *
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved.
 */
/* eslint-disable no-restricted-globals */

// self代表子线程自身，即子线程的全局对象

// sparkMD5 计算文件的 md5 值 是一个 32 位的字符串
self.importScripts("https://cdn.bootcss.com/spark-md5/3.0.0/spark-md5.js"); // 同步

self.onmessage = async (event) => {
  console.log(event);
  const { partList } = event.data;
  const spark = new self.SparkMD5.ArrayBuffer();
  console.log(spark);
  let percent = 0;
  const perSize = 100 / partList.length; // 每个独立的part所占的百分比
  const buffers = await Promise.all(
    // 为什么这里不能用forEach
    // forEach()方法：返回值为undefined，因此无法使用链式调用。
    // 如果需要链式调用多个数组方法，例如过滤、映射和降低操作，则应使用map()方法
    partList.map(({ chunk, size }) => {
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(chunk);
        reader.onload = (event) => {
          percent = percent + perSize; // 每完成一个，百分比自增一个perSize
          self.postMessage({ percent: Number(percent.toFixed(2)) });
          console.log(event.target.result);
          resolve(event.target.result);
        };
      });
    })
  );
  buffers.forEach((buffer) => spark.append);
  //通知主进程，当前的哈希已经全部完成，并且把最终的hash值给主进程发过去
  self.postMessage({ percent: 100, hash: spark.end() });
  self.close();
};
