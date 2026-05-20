import React, { useState, useEffect } from "react";
import api from "../services/api";
import CharmCard from "../components/CharmCard";
import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import Pagination from "../components/Pagination";

const CharmListPage = () => {
  const [charms, setCharms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("-createdAt");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCharms();
  }, [search, category, sort, page]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories");
      setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchCharms = async () => {
    setLoading(true);
    try {
      const params = {
        search,
        sort,
        page,
        limit: 8,
      };
      if (category) params.category = category;

      const { data } = await api.get("/charms", { params });
      setCharms(data.data);
      setTotalPages(Math.ceil(data.total / 8));
    } catch (error) {
      console.error("Error fetching charms:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="charm-list-page container fade-in"
      style={{ padding: "60px 20px" }}
    >
      <header style={{ marginBottom: "60px", textAlign: "center" }}>
        <h2 className="section-title">Bộ sưu tập Charm</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <SearchBar
            onSearch={(val) => {
              setSearch(val);
              setPage(1);
            }}
          />
          <FilterBar
            categories={categories}
            onFilter={(val) => {
              setCategory(val);
              setPage(1);
            }}
            onSort={(val) => {
              setSort(val);
              setPage(1);
            }}
          />
        </div>
      </header>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "2rem",
            }}
          >
            {charms.map((charm) => (
              <CharmCard key={charm._id} charm={charm} />
            ))}
          </div>

          {charms.length === 0 && (
            <div className="empty-state">
              <p>Không tìm thấy hạt charm nào phù hợp với yêu cầu của bạn.</p>
            </div>
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default CharmListPage;
