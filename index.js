'use strict';

var app = new Vue({
        el: '#app',
        data: {
            feeds: [],
            feedUrls: [],
            parser: null,
            totalFeeds: 20,
            refreshDate: null,
            temperature: null,
            selectedTab: 'news',
			bookmarks: [],
            newBookmark: {}
        },
		computed: {
            sortedBookmarks: function () {
                function compare(a, b) {
                    if (a.category !== undefined && b.category !== undefined && a.category != b.category) {
                        return a.category.localeCompare(b.category);
                    } else {
                        return a.name.localeCompare(b.name);
                    }
                }

                return this.bookmarks.sort(compare);
            }
        },
        mounted: function () {
            this.parser = new RSSParser();
            this.refreshFeeds();
			
	    	if (localStorage["feedsUrls"]) {
        		this.feedUrls = JSON.parse(localStorage["feedUrls"]);
				this.totalFeeds = localStorage["totalFeeds"];
        	} else {
				localStorage.setItem("feedUrls", []);
				localStorage.setItem("totalFeeds", 20);
	    	}
			
	    	if (localStorage["bookmarks"]) {
        		this.bookmarks = JSON.parse(localStorage["bookmarks"]);
        	} else {
				localStorage.setItem("bookmarks", []);
	    	}
        },
        methods: {
            addZero: function (i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            },
            formatDate: function (date) {
                if (!date) {
                    return;
                }
                if (typeof date === 'string') {
                    date = new Date(date);
                }
                return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes()) + ' ';
            },
            formatDescription: function (description) {
                let regex = /(<([^>]+)>)/ig;
                description = description.replace(regex, '').trim();
                let txt = document.createElement('textarea');
                txt.innerHTML = description;
                description = txt.value;
                return (description.length > 256) ? description.substr(0, 255) + '...' : description;
            },
            refreshFeeds: function () {
                let singleFeed = Math.round(this.totalFeeds / this.feedUrls.length);
                this.refreshDate = new Date();
                this.feedUrls.forEach((url) => {
                    this.parser.parseURL(url, (err, feed) => {
                        if (err) {
                            throw err;
                        }

                        if (feed.items) {
                            feed.items.forEach((value, key) => {
                                value.content = this.formatDescription(value.content);
                                if (key > singleFeed) {
                                    return false;
                                }
                                this.feeds.push(value);
                            });

                            this.feeds.sort(function (a, b) {
                                // Turn your strings into dates, and then subtract them
                                // to get a value that is either negative, positive, or zero.
                                return new Date(b.pubDate) - new Date(a.pubDate);
                            });
                        }
                    });
                });
            },
            isActive: function (name) {
                if (this.selectedTab === name) {
                    return 'is-active';
                }
            },
			addBookmark: function () {
                this.bookmarks.push(this.newBookmark);
                localStorage.setItem("bookmarks", JSON.stringify(this.bookmarks));
            },
            deleteBookmark: function (index) {
                this.bookmarks.splice(index, 1);
                localStorage.setItem("bookmarks", JSON.stringify(this.bookmarks));
            }
        }
    });

setInterval(refresh, 1800000);

function refresh() {
    app.feeds = [];
    app.refreshFeeds();

    app.getTemperature();
}
