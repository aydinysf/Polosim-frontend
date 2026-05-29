import re

with open("app/[locale]/plans/page.tsx", "r") as f:
    content = f.read()

pagination_pattern = r'''\{/\* Pagination - Elegant Style \*/\}\s*\{viewMode === "plans" && totalPages > 1 && \(\s*<div className="flex items-center justify-center gap-1 pt-5 mt-5 border-t border-\[var\(--gray-mid\)\]">\s*<button\s*onClick=\{[^}]+\}\s*disabled=\{currentPage === 1\}\s*className="w-9 h-9 rounded-lg flex items-center justify-center border border-\[var\(--gray-mid\)\] text-\[var\(--navy\)\] hover:border-\[var\(--gold\)\] hover:text-\[var\(--gold\)\] disabled:opacity-40 disabled:cursor-not-allowed transition-all">\s*<ChevronLeft className="h-4 w-4" />\s*</button>\s*<div className="flex items-center gap-1 mx-2">\s*\{\(\(\) => \{\s*const lastPage = totalPages;\s*const pages: \(number \| string\)\[\] = \[\];\s*if \(lastPage <= 10\) \{\s*for \(let i = 1; i <= lastPage; i\+\+\) pages\.push\(i\);\s*\} else \{\s*pages\.push\(1, 2, 3\);\s*const endStart = lastPage - 3;\s*if \(currentPage > 4 && currentPage < endStart - 1\) \{\s*pages\.push\("..."\);\s*pages\.push\(currentPage - 1, currentPage, currentPage \+ 1\);\s*pages\.push\("..."\);\s*\} else \{\s*pages\.push\("..."\);\s*\}\s*for \(let i = endStart; i <= lastPage; i\+\+\) pages\.push\(i\);\s*\}\s*return pages\.map\(\(page, index\) => \{\s*if \(page === "..."\) return <span key=\{\`ellipsis-\$\{index\}\`\} className="px-2 text-\[var\(--gray-text\)\]">\.\.\.</span>;\s*return \(\s*<button\s*key=\{page\}\s*onClick=\{\(\) => setCurrentPage\(page as number\)\}\s*className=\{`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold transition-all \$\{\s*currentPage === page\s*\? "bg-\[var\(--gold\)\] text-white shadow-sm border border-\[var\(--gold\)\]"\s*: "bg-transparent border border-transparent text-\[var\(--navy\)\] hover:bg-\[var\(--gray-bg\)\]"\s*\}`\}\s*>\s*\{page\}\s*</button>\s*\);\s*\}\);\s*\}\)\(\)\}\s*</div>\s*<button\s*onClick=\{[^}]+\}\s*disabled=\{currentPage === totalPages\}\s*className="w-9 h-9 rounded-lg flex items-center justify-center border border-\[var\(--gray-mid\)\] text-\[var\(--navy\)\] hover:border-\[var\(--gold\)\] hover:text-\[var\(--gold\)\] disabled:opacity-40 disabled:cursor-not-allowed transition-all">\s*<ChevronRight className="h-4 w-4" />\s*</button>\s*</div>\s*\)\}'''
pagination_replacement = """{/* Pagination */}
              {viewMode === "plans" && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 mt-8 border-t border-[var(--gray-mid)]">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="flex items-center gap-2 px-2">
                    {(() => {
                      const lastPage = totalPages;
                      const pages: (number | string)[] = [];

                      if (lastPage <= 10) {
                        for (let i = 1; i <= lastPage; i++) pages.push(i);
                      } else {
                        pages.push(1, 2, 3);
                        const endStart = lastPage - 3;

                        if (currentPage > 4 && currentPage < endStart - 1) {
                          pages.push("...");
                          pages.push(currentPage - 1, currentPage, currentPage + 1);
                          pages.push("...");
                        } else {
                          pages.push("...");
                        }

                        for (let i = endStart; i <= lastPage; i++) pages.push(i);
                      }

                      return pages.map((page, index) => {
                        if (page === "...") return <span key={`ellipsis-${index}`} className="px-2 text-[var(--gray-text)] font-bold">...</span>;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all shadow-sm ${
                              currentPage === page
                                ? "bg-[var(--gold)] text-white border border-[var(--gold)]"
                                : "bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      });
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-[var(--gray-mid)] text-[var(--navy)] hover:border-[var(--gold)] hover:text-[var(--gold)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}"""
content = re.sub(pagination_pattern, pagination_replacement, content, flags=re.DOTALL)

with open("app/[locale]/plans/page.tsx", "w") as f:
    f.write(content)
print("Pagination Done")
