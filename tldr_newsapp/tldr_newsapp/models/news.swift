//
//  news.swift
//  tldr_newsapp
//
//  Created by Huy Tran on 5/23/25.
//

struct news_block_info: Identifiable, Codable {
    let id: String
    let title: String
    let url: String
    let read_time: Int
    let jpeg_url: String?

    init(id: String, title: String, url: String, read_time: Int, jpeg_url: String? = "") {
        self.id = id
        self.title = title
        self.url = url
        self.read_time = read_time
        self.jpeg_url = jpeg_url
    }
}
