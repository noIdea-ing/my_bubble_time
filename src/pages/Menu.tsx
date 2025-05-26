import React from 'react'
import Navbar from '../components/Navbar'

const Menu = () => {
  const menuItems = [
    {
      category: "Classic Milk Tea",
      items: [
        { name: "Pearl Milk Tea", price: 7.90 },
        { name: "Brown Sugar Milk Tea", price: 8.90 },
        { name: "Taro Milk Tea", price: 8.90 },
        { name: "Thai Milk Tea", price: 7.90 },
      ]
    },
    {
      category: "Fruit Tea",
      items: [
        { name: "Passion Fruit Green Tea", price: 8.90 },
        { name: "Peach Oolong Tea", price: 8.90 },
        { name: "Lemon Green Tea", price: 7.90 },
        { name: "Strawberry Black Tea", price: 8.90 },
      ]
    }
  ];

  return (
    <div>
      <Navbar />
      <div className="container py-5">
        <h1 className="text-center text-primary mb-5">Bubble Time Menu</h1>
        
        {menuItems.map((category, index) => (
          <div key={index} className="mb-5">
            <h2 className="border-bottom border-primary pb-2 mb-4">{category.category}</h2>
            <div className="row g-4">
              {category.items.map((item, idx) => (
                <div key={idx} className="col-md-6 col-lg-3">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text text-primary fw-bold">
                        RM {item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Menu