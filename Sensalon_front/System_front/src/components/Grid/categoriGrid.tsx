import React from 'react';
import { Sparkles, Scissors, Droplet, Sun, Leaf, Gift, Heart, Star, Zap, Smile, Crown, Feather, Package, Beaker, Brush } from 'lucide-react';
import { Categorie } from '../../interfaces/categorias';

interface CategoryGridProps {
  categoriasVisita: Categorie[];
}

const CategoryGrid: React.FC<CategoryGridProps> = ({ categoriasVisita }) => {
  const getCategoryIcon = (categoryName: string) => {
    const lowercaseName = categoryName.toLowerCase();
    if (lowercaseName.includes('brillo') || lowercaseName.includes('iluminador')) return Sparkles;
    if (lowercaseName.includes('cabello') || lowercaseName.includes('peluquería')) return Scissors;
    if (lowercaseName.includes('hidratante') || lowercaseName.includes('crema')) return Droplet;
    if (lowercaseName.includes('protector solar') || lowercaseName.includes('bronceador')) return Sun;
    if (lowercaseName.includes('natural') || lowercaseName.includes('orgánico')) return Leaf;
    if (lowercaseName.includes('set') || lowercaseName.includes('kit')) return Gift;
    if (lowercaseName.includes('cuidado') || lowercaseName.includes('tratamiento')) return Heart;
    if (lowercaseName.includes('premium') || lowercaseName.includes('lujo')) return Star;
    if (lowercaseName.includes('energía') || lowercaseName.includes('vitalidad')) return Zap;
    if (lowercaseName.includes('dental') || lowercaseName.includes('sonrisa')) return Smile;
    if (lowercaseName.includes('exclusivo') || lowercaseName.includes('elite')) return Crown;
    if (lowercaseName.includes('ligero') || lowercaseName.includes('suave')) return Feather;
    if (lowercaseName.includes('shampoo') || lowercaseName.includes('acondicionador')) return Beaker; // Usamos Spray como alternativa
    if (lowercaseName.includes('tinte') || lowercaseName.includes('coloración')) return Brush;
    if (lowercaseName.includes('aceite') || lowercaseName.includes('suero')) return Beaker;
    return Package; // Ícono predeterminado
  };

  return (
    <section className="py-10 mb-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Explore by category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
          {categoriasVisita.map((category) => {
            const IconComponent = getCategoryIcon(category.vcname);
            return (
              <button
                key={category.iIdCategory}
                className="relative group overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-6 w-[250px] h-[180px] flex flex-col items-center justify-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <IconComponent className="w-16 h-16 mb-4 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-800 text-center">{category.vcname}</h3>
                  <p className="text-sm mt-2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                   Explorar
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>

  );
};

export default CategoryGrid;
