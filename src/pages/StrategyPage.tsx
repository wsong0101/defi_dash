import { useState } from 'react';
import { categories } from '../config/categories';
import type { ArbitrageCategoryId } from '../domain/types';
import { Tabs } from '../components/Tabs';
import { CategoryView } from '../views/CategoryView';
import styles from '../App.module.css';

export function StrategyPage() {
  const [activeCategory, setActiveCategory] = useState<ArbitrageCategoryId>('lending');

  const tabItems = categories.map((category) => ({
    id: category.id,
    label: category.label,
    disabled: category.disabled,
  }));

  return (
    <>
      <Tabs
        tabs={tabItems}
        activeId={activeCategory}
        onChange={(id) => setActiveCategory(id as ArbitrageCategoryId)}
      />

      <main className={styles.content}>
        <CategoryView categoryId={activeCategory} />
      </main>
    </>
  );
}
