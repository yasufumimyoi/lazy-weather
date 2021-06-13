"use strict";

const line = require("@line/bot-sdk");
const axios = require("axios");

require("dotenv").config();

const config = {
  channelSecret: process.env.CHANEEL_SECRET,
  channelAccessToken: process.env.CHANEEL_ACCESS_TOKEN,
};

const client = new line.Client(config);

const main = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const tomorrow = `${month}-${date + 1}`;

  const url = `https://api.openweathermap.org/data/2.5/forecast?q=tokyo&appid=${process.env.API_KEY}&lang=ja`;
  const res = await axios.get(url);

  let content = [];
  let icon = [];

  for (let i = 0; i < res.data.list.length; i++) {
    let targetDate = res.data.list[i].dt_txt;
    if (targetDate.indexOf(tomorrow) > -1) {
      let condition = res.data.list[i].weather[0].main;
      if (condition === "Rain") {
        let description = res.data.list[i].weather[0].description;
        const text = `${targetDate.slice(11, -3)} ~ ${description} `;

        content.push(text);
        icon.push(res.data.list[i].weather[0].icon);
      }
    }
  }

  const payload = {
    type: "flex",
    altText: "明日は雨が降る可能性があります",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: `https://openweathermap.org/img/wn/${icon[0]}@2x.png`,
        size: "md",
        aspectRatio: "20:13",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "Lazy Weather",
            weight: "bold",
            size: "xl",
            align: "center",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "baseline",
                contents: [
                  {
                    type: "text",
                    text: "Time",
                    color: "#aaaaaa",
                    size: "sm",
                    align: "center",
                  },
                  {
                    type: "text",
                    text: content.join("\n"),
                    wrap: true,
                    color: "#666666",
                    size: "sm",
                    align: "center",
                  },
                ],
                justifyContent: "center",
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [],
        flex: 0,
      },
    },
  };

  if (content.length > 0) {
    await client.broadcast(payload);
  }
};

main();
