import React from 'react'
import { BarChart, Bar, XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,Cell } from 'recharts';



const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white shadow-md rounded-lg p-2 border border-gray-300">
      <p className="text-xs font-semibold text-purple-800 mb-1">
        {data.category}
      </p>
      <p className="text-sm text-gray-600">
        Amount:{" "}
        <span className="font-medium text-gray-900">
          ₹{data.amount}
        </span>
      </p>
    </div>
  );
};
const CustomBarChart = ({data, xKey}) => {

    // Function to ALternate Colors
    const getBarColor = (index) => {
        return index % 2 === 0 ? "#875cf5" : "#cfbefb";
    };

    
  return (
    <div className='bg-white mt-6'>
        <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data}>
                <CartesianGrid stroke='none'/>

                <XAxis dataKey={xKey} tick={{fontSize:12, fill: "#555"}} stroke='none' />
                <YAxis tick={{fontSize:12, fill:"#555"}} stroke='none'/>

                <Tooltip content={(props) => <CustomTooltip {...props} />} />


                <Bar
                    dataKey="amount"
                    fill='#FF8042'
                    radius={[10,10,0,0]}
                    activeDot = {{r: 8, fill: "yellow"}}
                    activeStyle = {{fill: "green"}}
                >
                    {data?.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(index)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  )
}

export default CustomBarChart