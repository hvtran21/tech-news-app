//
//  news.swift
//  tldr_newsapp
//
//  Created by Huy Tran on 5/23/25.
//

struct NewsArticle: Identifiable, Codable {
    let id: String
    let title: String
    let url: String
}
