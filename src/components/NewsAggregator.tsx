import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import styled from "styled-components";
import { FaNewspaper, FaSearch } from "react-icons/fa";

// Styled components
const Container = styled.div`
  min-height: 100vh;
  background-color: #f3f4f6;
  padding: 24px;
`;

const Navbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2563eb;

  svg {
    margin-right: 8px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NavButton = styled.button<{ $active?: boolean }>`
  padding: 8px 12px;
  border-radius: 8px;
  color: #fff;
  background-color: ${(props) => (props.$active ? "#2563eb" : "#6b7280")};
  cursor: pointer;
  border: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${(props) => (props.$active ? "#1d4ed8" : "#4b5563")};
  }
`;

const SearchBox = styled.input`
  padding: 8px;
  width: 200px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #2563eb;
  }
`;

const SearchIconContainer = styled.div`
  padding: 8px;
  border-radius: 50%;
  background-color: #2563eb;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1d4ed8;
  }

  svg {
    color: #fff;
    font-size: 1.2rem;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const NewsCard = styled.div`
  background-color: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  img {
    width: 100%;
    height: 192px;
    object-fit: cover;
    border-radius: 8px;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-top: 8px;
  }

  p {
    color: #4b5563;
    font-size: 0.875rem;
    margin-top: 4px;
  }

  a {
    display: block;
    margin-top: 16px;
    color: #2563eb;
    font-weight: bold;
    text-decoration: none;

    &:hover {
      color: #1d4ed8;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  background-color: #2563eb;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:disabled {
    background-color: #6b7280;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
`;

// Fetch News Function
const fetchNews = async ({ queryKey }: { queryKey: [string, string, string, number] }) => {
  const [, category, searchTerm, currentPage] = queryKey;
  const BACKEND_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5001"
      : process.env.REACT_APP_BACKEND_URL;

  const url = searchTerm
    ? `${BACKEND_URL}/api/news?search=${searchTerm}&page=${currentPage}`
    : `${BACKEND_URL}/api/news?category=${category}&page=${currentPage}`;

  const response = await axios.get(url);
  return response.data.articles || [];
};

const NewsAggregator: React.FC = () => {
  const [category, setCategory] = useState("technology");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const { data: news = [], isLoading: loading, error } = useQuery({
    queryKey: ["news", category, searchTerm, currentPage],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleCategoryButtonClick = (newCategory: string) => {
    if (newCategory !== category) {
      setCategory(newCategory);
      setCurrentPage(1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <Container>
      <Navbar>
        <Logo>
          <FaNewspaper size={24} />
          Personal News Aggregator
        </Logo>
        <NavLinks>
          {["technology", "business", "entertainment", "health", "science", "sports"].map((cat) => (
            <NavButton key={cat} onClick={() => handleCategoryButtonClick(cat)} $active={category === cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </NavButton>
          ))}
          {showSearchInput ? (
            <SearchBox
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              onBlur={() => setShowSearchInput(false)}
            />
          ) : (
            <SearchIconContainer onClick={() => setShowSearchInput(true)}>
              <FaSearch />
            </SearchIconContainer>
          )}
        </NavLinks>
      </Navbar>

      {error ? (
        <p style={{ textAlign: "center", color: "#4b5563" }}>{error.message}</p>
      ) : loading ? (
        <p style={{ textAlign: "center", color: "#4b5563" }}>Loading news...</p>
      ) : (
        <>
          <NewsGrid>
            {news.map((article: any, index: any) => (
              <NewsCard key={index}>
                {article.urlToImage && <img src={article.urlToImage} alt={article.title} />}
                <h2>{article.title}</h2>
                <p>{article.source.name}</p>
                <p>{article.description}</p>
                <p style={{ color: article.isFake ? "green" : "red", fontWeight: "bold" }}>
                  {article.isFake ? "✅ Real News" : "⚠️ Fake News"  }
                </p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  Read more
                </a>
              </NewsCard>
            ))}
          </NewsGrid>

          <Pagination>
            <PageButton onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </PageButton>
            <PageButton onClick={() => setCurrentPage((prev) => prev + 1)}>Next</PageButton>
          </Pagination>
        </>
      )}
    </Container>
  );
};

export default NewsAggregator;
