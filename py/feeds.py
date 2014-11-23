#!/usr/bin/python3

import os
import json
import urllib.request

feed_urls = {
    "world": ["http://feeds2.feedburner.com/time/topstories", "http://rss.cnn.com/rss/edition.rss"],
    "business": ["http://feeds.bbci.co.uk/news/business/rss.xml", "http://rss.cnn.com/rss/money_latest.rss"],
    "politics": ["http://feeds.bbci.co.uk/news/politics/rss.xml"],
    "health": ["http://feeds.bbci.co.uk/news/health/rss.xml"],
    "science": ["http://www.popsci.com/rss.xml", "http://www.huffingtonpost.com/feeds/verticals/science/news.xml"],
    "tech": ["http://www.theverge.com/rss/frontpage", "http://feeds.mashable.com/Mashable", "http://podcasts.engadget.com/rss.xml", "http://feeds.gawker.com/gizmodo/full"],
    "entertainment": ["http://feeds.eonline.com/eonline/topstories", "http://www.huffingtonpost.com/feeds/verticals/entertainment/news.xml"],
    "art": ["http://www.artnews.com/feed/"],
    "education": ["http://feeds.bbci.co.uk/news/education/rss.xml"]
}

topics = os.environ["QUERY_STRING"].split(",")

xml2json_url = "http://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=50&q=%s"

comb_entries = []

for topic in topics:
    for url in feed_urls[topic]:
        final_url = xml2json_url % (url)
        response = urllib.request.urlopen(final_url)
        
        data = json.loads(response.read().decode("utf-8"))
        entries = data["responseData"]["feed"]["entries"]
        
        for entry in entries:
            entry["newsstandTopic"] = topic
        
        comb_entries.extend(entries)

print("Content-type: application/json\n")
        
print(json.dumps(comb_entries))