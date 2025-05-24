//
//  ContentView.swift
//  tldr_newsapp
//
//  Created by Huy Tran on 5/22/25.
//

import SwiftUI

struct base_page: View {
    let username = "Huy"
    
    var body: some View {
        Text("Welcome, \(username).")
            .font(.largeTitle)
            .foregroundStyle(.blue)
            .position(x: 200, y: 20)
    }
}

// set up for displaying any news article, pass arguments to it
struct news_block: View {
    let title: String
    let summary: String
    
    init(title: String, summary: String) {
        self.summary = summary
        self.title = title
    }
    
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading) {
            Text(title)
                .font(.headline)
            Text(summary)
                .font(.body)
            
            Image(systemName: isExpanded ? "chevron.compact.down" : "chevron.compact.up")
                .onTapGesture {
                    self.isExpanded.toggle()
                }
            if isExpanded {
                Image("test_thumbnail")
            }
        }
    }
}

// main_view has the purpose of rendering all views appropriately.
struct main_view: View {
    var body: some View {
        ZStack {
            base_page()
            news_block(title: "This is a title", summary: "This is a summary")
        }
        
    }
}

#Preview {
    main_view()
}
