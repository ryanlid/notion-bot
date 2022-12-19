import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { load } from "cheerio";

type MOVIE = {
  doubanUrl: string;
  doubanId: string;
  // 中文片名
  title: string;
  // 原文片名
  native: string;
  // 海报
  poster: string;
  // 导演
  director: string;
  // 编剧
  writer: string;
  // 主演
  actor: string;
  // 类型
  genres: string;
  // 地区
  region: string;
  // 语言
  language: string;
  // imdb号
  imdb: string;
  // 评分
  rating: string;
  // 上映时间
  releaseTime: string;
  // 上映年份
  year: string;
  // DoubanContent
  doubanContent: string;
};
const movie: MOVIE = {
  doubanUrl: "",
  doubanId: "",
  // 中文片名
  title: "",
  // 原文片名
  native: "",
  // 海报
  poster: "",
  // 导演
  director: "",
  // 编剧
  writer: "",
  // 主演
  actor: "",
  // 类型
  genres: "",
  // 地区
  region: "",
  // 语言
  language: "",
  // imdb号
  imdb: "",
  // 评分
  rating: "",
  // 上映时间
  releaseTime: "",
  // 上映年份
  year: "",
  // 豆瓣全部内容
  doubanContent: "",
};

async function submitNotion(page_id: string, movie: MOVIE) {
  let data = {
    parent: {
      type: "database_id",
      database_id: page_id,
      // page_id:page_id
    },
    properties: {
      Title: {
        title: [{ type: "text", text: { content: movie.title } }],
      },
      Native: {
        rich_text: [{ type: "text", text: { content: movie.native } }],
      },
      Year: {
        rich_text: [{ type: "text", text: { content: movie.year } }],
      },
      IMDB: {
        rich_text: [{ type: "text", text: { content: movie.imdb } }],
      },
      Director: {
        rich_text: [{ type: "text", text: { content: movie.director } }],
      },
      Actor: {
        rich_text: [{ type: "text", text: { content: movie.actor } }],
      },
      // Genres: {
      //   rich_text: [{ type: 'multi_select', text: { content: movie.genres } }],
      // },
      Region: {
        rich_text: [{ type: "text", text: { content: movie.region } }],
      },
      Writer: {
        rich_text: [{ type: "text", text: { content: movie.writer } }],
      },
      Poster: {
        files: [
          { name: "封面", type: "external", external: { url: movie.poster } },
        ],
      },
      DoubanContent: {
        rich_text: [{ type: "text", text: { content: movie.doubanContent } }],
      },

      Douban: { url: movie.doubanUrl },
    },
  };

  let headers = {
    Accept: "application/json",
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
    Authorization: "Bearer " + process.env.NOTION_TOKEN,
  };
  let url = "https://api.notion.com/v1/pages";

  let result = await axios.post(url, data, { headers });
  return result;
}

export const addMovieInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let doubanId = req.body.doubanId;
  if (!doubanId || !process.env.NOTION_DATABASE_ID) {
    res.send("参数错误");
    return;
  }

  let doubanUrl = `https://movie.douban.com/subject/${doubanId}/`;
  // let doubanUrl = `https://movie.douban.com/subject/35675082/`;

  axios
    .get(doubanUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPad; CPU OS 16_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/107.0.1418.62 Version/16.0 Mobile/15E148 Safari/604.1",
        // 'Accept-Encoding': 'gzip, compress, deflate, br',
        "Accept-Encoding": "",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      },
    })
    .then(async (resData) => {
      const $ = load(resData.data);
      movie.doubanUrl = doubanUrl;
      movie.doubanId = doubanId as string;
      movie.title = $("#content h1>span").text().split("(")[0];
      movie.year = $("#content h1>span").text().split("(")[1].split(")")[0];
      movie.native = $("#content h1>span").text();
      movie.poster = $("#mainpic a>img").attr("src") || "";
      movie.director = $("#info span:nth-child(1) span:nth-child(2)").text();
      movie.writer = $("#info span:nth-child(2) span:nth-child(2)").text();
      movie.actor = $("#info span:nth-child(3) span:nth-child(2)").text();
      movie.genres = $('#info [property="v:genre"]').text();
      movie.region = $("#info span:nth-child(6) span:nth-child(2)").text();
      movie.language = $("#info span:nth-child(7) span:nth-child(2)").text();
      movie.releaseTime = $('#info [property="v:initialReleaseDate"]').text();
      movie.rating = $("#info span:nth-child(5) span:nth-child(2)").text();
      movie.imdb = $("#info span:nth-last-child(2) span:nth-child(2)").text();
      movie.doubanContent = $("#info").text();
      await submitNotion(process.env.NOTION_DATABASE_ID || "", movie);
      res.send(movie);
    })
    .catch((err) => {
      console.log("doubanUrl", err);
      res.send(err.data.message || "请求出错");
    });
};
