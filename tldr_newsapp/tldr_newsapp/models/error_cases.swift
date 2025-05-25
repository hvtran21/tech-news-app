//
//  error_cases.swift
//  tldr_newsapp
//
//  Created by Huy Tran on 5/24/25.
//

enum error: Error {
    case empty_title
    case empty_summary
    case empty_url
    case empty_image_url

    var description: String {
        switch self {
        case .empty_title:
            return "Title is empty"
        case .empty_summary:
            return "Summary is empty"
        case .empty_url:
            return "URL is empty"
        case .empty_image_url:
            return "Image URL is empty"
        }
    }
}
