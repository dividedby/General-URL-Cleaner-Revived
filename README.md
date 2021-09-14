<h1>General URL Cleaner Revived</h1>
Cleans various URL's and/or page links on Google, Youtube, Newegg, Amazon, Ebay, Facebook, Twitter, IMDB, StaticICE, Pocket, Target

<br>Feel free to report issues or make pull requests for fixes, enhancements, etc: https://github.com/dividedby/General-URL-Cleaner-Revived

<br>This script forked from beck's script. https://greasyfork.org/en/scripts/395298-general-url-cleaner

<h3>Additional fixed</h3>
[Add] Add Target.com cleaned item urls, will look like this: https://www.target.com/p/A-[item-id]<br>
[Fix] Google Takeout downloads, added takeout.google.com to the exclusions: https://greasyfork.org/en/scripts/395298-general-url-cleaner/discussions/95974<br>
[Fix] Resolved issue with Google search parameter sa, without it certain search links aren't able to redirect properly: https://greasyfork.org/en/scripts/395298-general-url-cleaner/discussions/95974<br>
[Add] Strip s parameter from Twitter post links: https://greasyfork.org/en/scripts/395298-general-url-cleaner/discussions/71892<br>
[Fix] Opening images from normal Google search now expands the selected image: https://greasyfork.org/en/scripts/395298-general-url-cleaner/discussions/87398
<h3>Google</h3>
Cleans Google search URL's
A normal google search URL might look like this: https://www.google.com/search?num=100&q=google&oq=google&gs_l=serp.3..0l10.7976.8565.0.9999.6.6.0.0.0.0.358.617.2-1j1.2.0....0...1c.1.64.serp..4.2.615.BQ3ZvdzuPGE
A cleaned google search url: https://www.google.com/search?q=google
Removes redirection of Google results links
Works with international google sites (not just .com)
<h3>Bing</h3>
Cleans bing search URL's
A normal google search URL might look like this: https://www.bing.com/search?q=google&qs=n&form=QBLH&pq=google&sc=9-2&sp=-1&sk=&cvid=97312C9A5750490FB6C424E46C6759EF
A cleaned bing search url: https://www.bing.com/search?q=google
<h3>Youtube</h3>
Cleaned url always looks like this: https://www.youtube.com/watch?v=[video-id]
Removes redirection of description links
<h3>Amazon</h3>
Cleaned url always looks like this: http://www.amazon.com/gp/product/[item-id]/ Or this: http://www.amazon.com/dp/[item-id]/
Works with international sites (not just .com)
<h3>Newegg</h3>
Cleaned url always looks like this: http://www.newegg.com/Product/Product.aspx?Item=[item-id]
<h3>Ebay</h3>
Cleaned url always looks like this: http://www.ebay.com/itm/[item-id]
Works with international sites (not just .com)
<h3>IMDB</h3>
Removes unnecessary parameters Facebook, Twitter, StaticICE, Disqus
Removes redirection of links
<h3>Pocket</h3>
Removes redirection of Pocket links
<h3>Target</h3>
Cleaned url always looks like this: https://www.target.com/p/A-[item-id]
Removes unnecessary parameters
