
url=https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=xxxxxxxx&site_id=xxxx&method=visit/toppage/a&start_date=20190101&end_date=20190105&metrics=pv_count,visitor_count

## 1. 关键参数

| 报告     | method          | metrics(指标, 数据单位)                                      | 其他参数                           |
| -------- | --------------- | ------------------------------------------------------------ | ---------------------------------- |
| 受访页面 | visit/toppage/a | pv_count (浏览量(PV)) visitor_count (访客数(UV)) ip_count (IP 数) visit1_count (入口页次数) outward_count (贡献下游浏览量) exit_count (退出页次数) average_stay_time (平均停留时长， 秒) exit_ratio (退出率，%) | source(来源类型) visitor(访客类型) |

## 实例
请求：
https://openapi.baidu.com/rest/2.0/tongji/report/getData?access_token=121.05bbe53f1050a1774f94f0444ed95d5f.Y7QVXBDa88kmz4aN0EbKmXtdZZVlwavoRPUSYQA.yp5QXQ&site_id=22468525&start_date=20250000&end_date=&metrics=pv_count%2Cvisitor_count&method=visit%2Ftoppage%2Fa&start_index=0&max_results=3000

响应：

{
	"result": {
		"offset": 0,
		"timeSpan": [
			"2025/09/23"
		],
		"fields": [
			"visit_page_title",
			"pv_count",
			"visitor_count"
		],
		"total": 3,
		"sum": [
			[
				12,
				5
			],
			[]
		],
		"pageSum": [
			[
				12,
				5
			],
			[],
			[]
		],
		"items": [
			[
				[
					{
						"name": "https://ikc.qzz.io",
						"pageId": "10991562572496888335"
					}
				],
				[
					{
						"name": "http://localhost:5173",
						"pageId": "11033897108535477245"
					}
				],
				[
					{
						"name": "https://ikc.qzz.io/article/devops-%E8%87%AA%E5%8A%A8%E5%8C%96%E9%83%A8%E7%BD%B2%E5%AE%9E%E8%B7%B5",
						"pageId": "13557563791967432417"
					}
				]
			],
			[
				[
					6,
					2
				],
				[
					3,
					1
				],
				[
					3,
					2
				]
			],
			[],
			[]
		]
	}
} 