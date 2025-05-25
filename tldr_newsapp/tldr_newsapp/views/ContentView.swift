//
//  ContentView.swift
//  tldr_newsapp
//
//  Created by Huy Tran on 5/22/25.
//

import SwiftUI
import UIKit

struct base_page: View {
    var body: some View {
        Text("TLDR Newsletter")
            .font(.largeTitle)
            .foregroundStyle(.blue)
            .position(x: 200, y: 20)
            .background(Color.black.opacity(0.95))
    }
}

// set up for displaying any news article, pass arguments to it
struct news_block: View {
    /*

    Sets up and displays a single news card.
    Arguments: news_block_info struct type
        -> not much error checking here. Encapsulating that somewhere else
        -> maybe given control where box is placed as new members in news_block_info?
     
     Returns:
        -> of View type, a news card with a title to the left, and thumbnail
           to the right.

     */
    
    // set up constants
    let article: news_block_info
    let full_box_width = UIScreen.main.bounds.width * 0.9
    let full_box_height = 130.0
    let title_char_limit = 85
    let text_box_width: CGFloat = 220
    let text_box_height: CGFloat = 100
    
    // initialie article struct type
    init(article: news_block_info) {
        self.article = article
    }
    

    // main view for news card
    var body: some View {
        ZStack {
            // background and of a single news card
            RoundedRectangle(cornerRadius: 5)
                .fill(.gray)
                .opacity(0.1)
                .frame(width: full_box_width, height: full_box_height)
            
            Text(self.article.title)
                // configuration for text
                .font(.title3)
                .fontDesign(.default)
                    .fontWeight(.medium)
                    .foregroundColor(.white).opacity(0.9)
    
                // configuration for text box
                .offset(x: -60, y: 0)
                .fixedSize(horizontal: false, vertical: false)
                .lineLimit(nil)
                .frame(width: text_box_width, height: text_box_height)
                .padding()
            
            // display thumnbnail image
            Image(self.article.jpeg_url!)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: CGFloat(120), height: CGFloat(100), alignment: .center)
                .clipped()
                .cornerRadius(4)
                .offset(x: 110, y: 0)
                .padding()

        }
    }
}

// main_view has the purpose of rendering all views appropriately.
struct main_view: View {
    let test_title = "This is an article about tech, and everything technology"
    let test_title2 = "This is another test, but different length of text, and this length is super long!"
    var test_article: news_block_info
    
    init() {
        self.test_article = news_block_info(id: "123", title: test_title2, url: "https://hello.com", read_time: 10, jpeg_url: "LaptopAndFlowers")
    }

    var body: some View {
        ZStack {
            base_page()
            news_block(article: test_article)
        }
        
    }
}

#Preview {
    main_view()
}
