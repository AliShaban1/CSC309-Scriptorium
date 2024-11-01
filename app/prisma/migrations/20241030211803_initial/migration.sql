-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT
);

-- CreateTable
CREATE TABLE "Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '',
    "authorID" INTEGER NOT NULL,
    "forked" BOOLEAN NOT NULL DEFAULT false,
    "forkedId" INTEGER,
    CONSTRAINT "Template_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Template_forkedId_fkey" FOREIGN KEY ("forkedId") REFERENCES "Template" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
