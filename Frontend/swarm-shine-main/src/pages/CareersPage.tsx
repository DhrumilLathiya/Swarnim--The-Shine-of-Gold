import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const openings = [
  {
    title: "Jewelry Designer",
    location: "Mumbai",
    type: "Full-time",
    department: "Design",
  },
  {
    title: "Store Manager",
    location: "Delhi",
    type: "Full-time",
    department: "Retail",
  },
  {
    title: "Digital Marketing Manager",
    location: "Mumbai",
    type: "Full-time",
    department: "Marketing",
  },
  {
    title: "Customer Support Executive",
    location: "Remote",
    type: "Full-time",
    department: "Support",
  },
];

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-40 pb-20">
        <div className="container mx-auto px-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-base text-muted-foreground mb-8">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground">Careers</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-semibold mb-4">Join Our Team</h1>
            <p className="text-muted-foreground text-xl mb-12 max-w-2xl">
              Be part of a team that's passionate about creating beautiful jewelry and 
              delivering exceptional experiences.
            </p>
            
            <h2 className="font-display text-2xl font-medium mb-6">Current Openings</h2>
            <div className="space-y-4">
              {openings.map((job, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-muted/30 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-medium text-xl">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-base text-muted-foreground">
                      <span>{job.location}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                      <span>•</span>
                      <span>{job.department}</span>
                    </div>
                  </div>
                  <Button asChild size="lg" className="text-base">
                    <Link to="/contact">Apply Now</Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 bg-accent/10 rounded-lg p-8 text-center">
              <h3 className="font-display text-2xl font-medium mb-2">Don't see a role that fits?</h3>
              <p className="text-muted-foreground text-lg mb-4">
                We're always looking for talented people. Send us your resume!
              </p>
              <Button variant="outline" asChild size="lg" className="text-base">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareersPage;
