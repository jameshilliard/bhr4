#!/bin/bash

echo "================================================================================" >&2
echo "Usage:" >&2
echo "  slavewrangler.sh -us == I am closer to the US" >&2
echo "  slavewrangler.sh -dk == I am closer to the DK" >&2

echo "" >&2
echo "Git remote URLs prior to remote wrangling:" >&2
git remote -v | grep origin | sed -e'1 s/origin/Fetch URL/' -e '2 s/origin/Push  URL/' >&2

while getopts ":us:dk" opt; do
  case $opt in
    u)
      echo "" >&2
      echo "US proximity selected." >&2
      GERRITORIGINURL=$(git config remote.origin.url | sed 's/gitgerrit-01.greenwavereality.eu/git-slave.greenwavereality.com/')
      git config --unset remote.origin.url
      git config remote.origin.url $GERRITORIGINURL

      GERRITPUSHURL=$(git config remote.origin.url | sed 's/git-slave.greenwavereality.com/gitgerrit-01.greenwavereality.eu/')
      git config --unset remote.origin.pushurl
      git config remote.origin.pushurl $GERRITPUSHURL
      ;;
    d)
      echo "" >&2
      echo "DK proximity selected." >&2

      GERRITORIGINURL=$(git config remote.origin.url | sed 's/git-slave.greenwavereality.com/gitgerrit-01.greenwavereality.eu/')
      git config --unset remote.origin.url
      git config remote.origin.url $GERRITORIGINURL

      GERRITPUSHURL=$(git config remote.origin.url | sed 's/git-slave.greenwavereality.com/gitgerrit-01.greenwavereality.eu/')
      git config --unset remote.origin.pushurl
      git config remote.origin.pushurl $GERRITPUSHURL
      ;;
  esac
done

echo "" >&2
echo "Git remote URLs after remote wrangling:" >&2
git remote -v | grep origin | sed -e'1 s/origin/Fetch URL/' -e '2 s/origin/Push  URL/' >&2
echo "================================================================================" >&2
