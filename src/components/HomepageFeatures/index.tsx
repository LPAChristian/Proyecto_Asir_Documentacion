import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description:JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Proyecto ASIR',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        Esta documentación está creada para el módulo de Administración de Sistemas Informáticos en Red (ASIR), orientada a facilitar el aprendizaje y consulta.
      </>
    ),
  },
  {
    title: 'Automatización de Servicios',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        El sistema permite desplegar servicios web de forma rápida y sencilla, utilizando tecnologías como Proxmox, Docker y FastAPI.
      </>
    ),
  },
  {
    title: '100% Open Source',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        Todos los componentes del proyecto están basados en software libre, fomentando la transparencia, la colaboración y la mejora continua.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
