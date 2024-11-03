-- CreateTable
CREATE TABLE "_likedBlogPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_likedBlogPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_likedBlogPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_dislikedBlogPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_dislikedBlogPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_dislikedBlogPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_likedBlogPosts_AB_unique" ON "_likedBlogPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_likedBlogPosts_B_index" ON "_likedBlogPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_dislikedBlogPosts_AB_unique" ON "_dislikedBlogPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_dislikedBlogPosts_B_index" ON "_dislikedBlogPosts"("B");
